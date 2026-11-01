"""
Pluggable OCR Service Orchestrator:
Coordinates the 3-tier OCR fallback chain:
1. PyMuPDF text layer (for digital PDFs with real embedded text)
2. Tesseract OCR (if tesseract binary is found on host / env var)
3. RapidOCR (lightweight onnxruntime deep-learning OCR fallback)

For image-only / scanned pages:
- Renders page with PyMuPDF at 200-300 DPI
- Applies light OpenCV preprocessing (grayscale, contrast, deskew) behind a flag
- Runs OCR engine
- If no OCR engine available: returns status "ocr_unavailable" with clear explanation.
"""
import io
import time
import logging
from typing import Dict, Any, List, Optional, Union
from PIL import Image
import numpy as np

from backend.app.services.ocr.base import (
    BaseOCREngine,
    PageOCRResult,
    OCRExtractResult,
    WordBox
)
from backend.app.services.ocr.pymupdf_engine import PyMuPDFTextEngine
from backend.app.services.ocr.tesseract_engine import TesseractOCREngine
from backend.app.services.ocr.rapidocr_engine import RapidOCREngine
from backend.app.services.ocr.preprocessing import preprocess_image

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

logger = logging.getLogger("ocr_service")


class PluggableOCRService:
    def __init__(self):
        self.pymupdf_engine = PyMuPDFTextEngine()
        self.tesseract_engine = TesseractOCREngine()
        self.rapidocr_engine = RapidOCREngine()

    def get_available_engines(self) -> List[str]:
        engines = []
        if self.pymupdf_engine.is_available:
            engines.append(self.pymupdf_engine.name)
        if self.tesseract_engine.is_available:
            engines.append(self.tesseract_engine.name)
        if self.rapidocr_engine.is_available:
            engines.append(self.rapidocr_engine.name)
        return engines

    def extract(
        self,
        file_bytes: bytes,
        filename: str = "document.pdf",
        preprocess: bool = True,
        dpi: int = 250
    ) -> OCRExtractResult:
        """
        Extracts text, word boxes, lines, and confidence from a PDF or image file.
        Follows statutory verification rules:
        - Digital PDF uses PyMuPDF text layer.
        - Scanned PDF / JPG / PNG renders at 200-300 DPI, runs OpenCV preprocessing,
          and executes Tesseract -> RapidOCR.
        - If no OCR engine is available for an image or scan: returns status="ocr_unavailable".
          Never silently fabricates text or returns fabricated mock data.
        """
        if not file_bytes:
            return OCRExtractResult(
                status="ocr_unavailable",
                status_message="Empty file received for OCR processing.",
                filename=filename,
                total_pages=0,
                pages=[],
                full_text="",
                mean_confidence=0.0
            )

        lower_name = filename.lower()
        is_pdf = lower_name.endswith(".pdf") or file_bytes[:4] == b"%PDF"

        pages_result: List[PageOCRResult] = []

        if is_pdf:
            if not fitz:
                return OCRExtractResult(
                    status="ocr_unavailable",
                    status_message="PyMuPDF is not installed on server to parse PDF documents.",
                    filename=filename,
                    total_pages=0,
                    pages=[],
                    full_text="",
                    mean_confidence=0.0
                )

            try:
                doc = fitz.open(stream=file_bytes, filetype="pdf")
            except Exception as e:
                return OCRExtractResult(
                    status="ocr_unavailable",
                    status_message=f"Failed to open PDF document: {e}",
                    filename=filename,
                    total_pages=0,
                    pages=[],
                    full_text="",
                    mean_confidence=0.0
                )

            total_pages = len(doc)
            if total_pages == 0:
                return OCRExtractResult(
                    status="ocr_unavailable",
                    status_message="PDF contains zero pages.",
                    filename=filename,
                    total_pages=0,
                    pages=[],
                    full_text="",
                    mean_confidence=0.0
                )

            for page_idx in range(total_pages):
                page = doc[page_idx]
                page_num = page_idx + 1

                # Step 1: Check if page has real embedded digital text layer
                if self.pymupdf_engine.is_available and self.pymupdf_engine.has_text_layer(page):
                    page_res = self.pymupdf_engine.extract_page(page, page_number=page_num)
                    pages_result.append(page_res)
                    continue

                # Step 2: Image-only scanned page -> render with PyMuPDF at target DPI
                try:
                    pix = page.get_pixmap(dpi=dpi)
                    img_bytes = pix.tobytes("png")
                    pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
                except Exception as e:
                    logger.error(f"Failed to render scanned PDF page {page_num} at {dpi} DPI: {e}")
                    continue

                # Preprocessing
                np_img = np.array(pil_img)
                if preprocess:
                    np_img = preprocess_image(np_img, grayscale=True, contrast=True, deskew=True)

                # Try OCR engines in specified order: Tesseract -> RapidOCR
                ocr_success = False
                if self.tesseract_engine.is_available:
                    try:
                        p_res = self.tesseract_engine.extract_page(np_img, page_number=page_num, width=pil_img.width, height=pil_img.height)
                        pages_result.append(p_res)
                        ocr_success = True
                    except Exception as e:
                        logger.warning(f"Tesseract OCR failed on page {page_num}: {e}")

                if not ocr_success and self.rapidocr_engine.is_available:
                    try:
                        p_res = self.rapidocr_engine.extract_page(np_img, page_number=page_num, width=pil_img.width, height=pil_img.height)
                        pages_result.append(p_res)
                        ocr_success = True
                    except Exception as e:
                        logger.warning(f"RapidOCR failed on page {page_num}: {e}")

                if not ocr_success:
                    # Neither OCR engine is available for scanned page
                    return OCRExtractResult(
                        status="ocr_unavailable",
                        status_message=(
                            "Scanned image-only PDF detected, but no OCR engine is available. "
                            "Please ensure RapidOCR (pip install rapidocr-onnxruntime) or "
                            "Tesseract OCR (tesseract.exe) is installed on this host."
                        ),
                        filename=filename,
                        total_pages=total_pages,
                        pages=[],
                        full_text="",
                        engine_name="None",
                        mean_confidence=0.0
                    )

        else:
            # Standalone Image File (PNG, JPG, TIFF)
            try:
                pil_img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
            except Exception as e:
                return OCRExtractResult(
                    status="ocr_unavailable",
                    status_message=f"Failed to open image file: {e}",
                    filename=filename,
                    total_pages=1,
                    pages=[],
                    full_text="",
                    mean_confidence=0.0
                )

            np_img = np.array(pil_img)
            if preprocess:
                np_img = preprocess_image(np_img, grayscale=True, contrast=True, deskew=True)

            ocr_success = False
            if self.tesseract_engine.is_available:
                try:
                    p_res = self.tesseract_engine.extract_page(np_img, page_number=1, width=pil_img.width, height=pil_img.height)
                    pages_result.append(p_res)
                    ocr_success = True
                except Exception as e:
                    logger.warning(f"Tesseract OCR failed on image: {e}")

            if not ocr_success and self.rapidocr_engine.is_available:
                try:
                    p_res = self.rapidocr_engine.extract_page(np_img, page_number=1, width=pil_img.width, height=pil_img.height)
                    pages_result.append(p_res)
                    ocr_success = True
                except Exception as e:
                    logger.warning(f"RapidOCR failed on image: {e}")

            if not ocr_success:
                return OCRExtractResult(
                    status="ocr_unavailable",
                    status_message=(
                        "Image document uploaded, but no OCR engine is available to process pixels. "
                        "Please install RapidOCR (rapidocr-onnxruntime) or Tesseract OCR."
                    ),
                    filename=filename,
                    total_pages=1,
                    pages=[],
                    full_text="",
                    engine_name="None",
                    mean_confidence=0.0
                )

        if not pages_result:
            return OCRExtractResult(
                status="ocr_unavailable",
                status_message="No readable text could be extracted from document pages.",
                filename=filename,
                total_pages=len(pages_result),
                pages=[],
                full_text="",
                mean_confidence=0.0
            )

        # Aggregate document-level results
        full_text = "\n\n".join(p.text for p in pages_result if p.text.strip())
        is_ocr = any(p.source_layer == "ocr" for p in pages_result)
        source_layers = set(p.source_layer for p in pages_result)
        source_layer = "mixed" if len(source_layers) > 1 else (source_layers.pop() if source_layers else "text_layer")

        # Pick primary engine name and language
        engine_counts: Dict[str, int] = {}
        lang_counts: Dict[str, int] = {}
        conf_sum = 0.0

        for p in pages_result:
            engine_counts[p.engine_name] = engine_counts.get(p.engine_name, 0) + 1
            lang_counts[p.language] = lang_counts.get(p.language, 0) + 1
            conf_sum += p.mean_confidence

        primary_engine = max(engine_counts.keys(), key=lambda k: engine_counts[k]) if engine_counts else "PyMuPDF text layer"
        primary_lang = max(lang_counts.keys(), key=lambda k: lang_counts[k]) if lang_counts else "eng"
        mean_conf = round(conf_sum / len(pages_result), 3) if pages_result else 0.0

        return OCRExtractResult(
            status="success",
            status_message="Document text successfully extracted.",
            filename=filename,
            total_pages=len(pages_result),
            pages=pages_result,
            full_text=full_text,
            engine_name=primary_engine,
            language=primary_lang,
            mean_confidence=mean_conf,
            is_ocr=is_ocr,
            source_layer=source_layer
        )


# Global singleton instance
ocr_service = PluggableOCRService()

