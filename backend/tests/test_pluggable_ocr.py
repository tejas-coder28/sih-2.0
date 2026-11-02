"""
Comprehensive Test Suite for Pluggable OCR Layer:
1. Digital PDF uses the PyMuPDF text layer (fast, confidence 0.99, is_ocr=False).
2. Generated scanned-PDF fixture and PNG fixture go through OCR and yield expected text & fields.
3. No engine installed returns status 'ocr_unavailable' (never silent empty fields, never fabricated text).
4. Blank or garbage image yields low confidence and Manual Review requirement.
5. Unsupported file type rejected at API boundary.
"""
import io
import os
import cv2
import numpy as np
import pytest
from PIL import Image
import fitz

from backend.app.services.ocr.base import OCRExtractResult
from backend.app.services.ocr.service import PluggableOCRService, ocr_service
from backend.app.services.ingestion_pipeline import ingestion_pipeline
from backend.app.services.field_extraction import field_extraction_engine


def create_digital_pdf_bytes() -> bytes:
    """Creates an in-memory digital PDF with PyMuPDF text layer."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    text = (
        "GOVERNMENT OF KARNATAKA\n"
        "DEPARTMENT OF FIRE AND EMERGENCY SERVICES\n"
        "FIRE SAFETY CLEARANCE CERTIFICATE\n"
        "NOC Number: FS/NOC/BLR/2025/9981\n"
        "Institution Name: Apex Institute of Technology & Science\n"
        "Valid Till: 2026-03-31\n"
        "Sanctioned Floors: G+3\n"
    )
    page.insert_text((50, 100), text, fontsize=12)
    return doc.tobytes()


def create_scanned_image_bytes() -> bytes:
    """Creates a rendered certificate image containing clear text."""
    img = np.ones((400, 800, 3), dtype=np.uint8) * 255
    cv2.putText(img, "GOVERNMENT OF KARNATAKA", (50, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
    cv2.putText(img, "FIRE SAFETY CLEARANCE CERTIFICATE", (50, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 0, 0), 2)
    cv2.putText(img, "NOC Number: FS/BLR/2025/7710", (50, 170), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 0, 0), 2)
    cv2.putText(img, "Institution: Apex Institute of Technology", (50, 230), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
    cv2.putText(img, "Valid Up To: 2026-06-30", (50, 290), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
    success, encoded = cv2.imencode(".png", img)
    assert success
    return encoded.tobytes()


def create_scanned_pdf_bytes() -> bytes:
    """Creates a PDF containing an image on page without digital text layer."""
    png_bytes = create_scanned_image_bytes()
    doc = fitz.open()
    page = doc.new_page(width=800, height=400)
    page.insert_image(page.rect, stream=png_bytes)
    # Ensure no embedded text layer exists
    assert len(page.get_text().strip()) == 0
    return doc.tobytes()


def test_digital_pdf_uses_text_layer():
    """Digital PDF must use PyMuPDF text layer with high confidence and is_ocr=False."""
    pdf_bytes = create_digital_pdf_bytes()
    res = ocr_service.extract(pdf_bytes, "digital_fire.pdf")

    assert res.status == "success"
    assert res.engine_name == "PyMuPDF text layer"
    assert res.source_layer == "text_layer"
    assert res.is_ocr is False
    assert res.mean_confidence >= 0.95
    assert len(res.pages) == 1
    assert len(res.pages[0].word_boxes) > 10
    assert "FIRE SAFETY" in res.full_text
    assert "FS/NOC/BLR/2025/9981" in res.full_text


def test_scanned_pdf_and_png_fixtures_go_through_ocr_and_yield_fields():
    """Scanned PDF and PNG fixtures must go through OCR and yield expected fields."""
    png_bytes = create_scanned_image_bytes()
    res_png = ocr_service.extract(png_bytes, "scan_fixture.png")

    assert res_png.status == "success"
    assert res_png.is_ocr is True
    assert res_png.source_layer == "ocr"
    assert res_png.engine_name in ["RapidOCR", "Tesseract"] or "Tesseract" in res_png.engine_name
    assert "FIRE SAFETY" in res_png.full_text
    assert "FS/BLR/2025/7710" in res_png.full_text or "7710" in res_png.full_text

    # Test Scanned PDF fixture
    scan_pdf_bytes = create_scanned_pdf_bytes()
    res_pdf = ocr_service.extract(scan_pdf_bytes, "scanned_doc.pdf")

    assert res_pdf.status == "success"
    assert res_pdf.is_ocr is True
    assert res_pdf.source_layer == "ocr"
    assert "FIRE" in res_pdf.full_text

    # Wire through full ingestion pipeline
    ingest_out = ingestion_pipeline.ingest_document(png_bytes, "fire_scan.png")
    assert ingest_out["status"] == "success"
    assert ingest_out["doc_type"] == "Fire Safety Certificate"
    assert ingest_out["is_ocr"] is True
    assert ingest_out["ocr_engine"] in ["RapidOCR", "Tesseract"] or "Tesseract" in ingest_out["ocr_engine"]
    assert len(ingest_out["pages"]) == 1
    assert len(ingest_out["pages"][0]["word_boxes"]) > 5


def test_no_engine_installed_returns_ocr_unavailable():
    """When no OCR engine is available, scanned images/PDFs must return 'ocr_unavailable'."""
    service = PluggableOCRService()
    # Simulate host with no OCR engines installed
    service.rapidocr_engine.is_available = False
    service.tesseract_engine.is_available = False

    scan_pdf_bytes = create_scanned_pdf_bytes()
    res_pdf = service.extract(scan_pdf_bytes, "scanned_doc.pdf")

    assert res_pdf.status == "ocr_unavailable"
    assert res_pdf.status_message is not None
    assert "no ocr engine is available" in res_pdf.status_message.lower()
    assert res_pdf.full_text == ""
    assert len(res_pdf.pages) == 0

    # Image should also return ocr_unavailable
    png_bytes = create_scanned_image_bytes()
    res_png = service.extract(png_bytes, "photo.png")
    assert res_png.status == "ocr_unavailable"
    assert "no ocr engine is available" in res_png.status_message.lower()


def test_blank_or_garbage_image_yields_low_confidence_and_manual_review():
    """A blank or garbage image must yield low confidence and manual_review_required=True."""
    # Blank white image
    blank_img = np.ones((300, 300, 3), dtype=np.uint8) * 255
    success, blank_bytes = cv2.imencode(".png", blank_img)
    assert success

    ingest_out = ingestion_pipeline.ingest_document(blank_bytes.tobytes(), "blank.png")
    assert ingest_out["status"] == "success"
    assert ingest_out["manual_review_required"] is True
    assert ingest_out["mean_confidence"] < 0.60 or len(ingest_out["full_extracted_text"].strip()) == 0


def test_unsupported_file_extension_rejected():
    """Unsupported document extensions must be rejected with 400 Bad Request."""
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    from backend.app.api.documents import router as documents_router

    mini_app = FastAPI()
    mini_app.include_router(documents_router)
    client = TestClient(mini_app)
    bad_file = io.BytesIO(b"fake word document contents")
    response = client.post(
        "/documents/ingest",
        files={"file": ("malicious.exe", bad_file, "application/octet-stream")}
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]
