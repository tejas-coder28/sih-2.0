"""
Pluggable OCR Layer Package:
Exposes common OCR interface, unified extract results, and the pluggable OCR service singleton.
"""
from backend.app.services.ocr.base import (
    WordBox,
    PageOCRResult,
    OCRExtractResult,
    BaseOCREngine
)
from backend.app.services.ocr.pymupdf_engine import PyMuPDFTextEngine
from backend.app.services.ocr.tesseract_engine import TesseractOCREngine
from backend.app.services.ocr.rapidocr_engine import RapidOCREngine
from backend.app.services.ocr.preprocessing import preprocess_image
from backend.app.services.ocr.service import PluggableOCRService, ocr_service

__all__ = [
    "WordBox",
    "PageOCRResult",
    "OCRExtractResult",
    "BaseOCREngine",
    "PyMuPDFTextEngine",
    "TesseractOCREngine",
    "RapidOCREngine",
    "preprocess_image",
    "PluggableOCRService",
    "ocr_service",
]

