"""
Base models and abstract interface for pluggable OCR layer.
Provides a common interface: extract(file) -> pages, each with text,
word boxes (x0, y0, x1, y1), per-word confidence, engine name, language.
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class WordBox(BaseModel):
    text: str
    x0: float
    y0: float
    x1: float
    y1: float
    confidence: float = 1.0


class PageOCRResult(BaseModel):
    page_number: int
    width: int
    height: int
    text: str
    word_boxes: List[WordBox] = Field(default_factory=list)
    lines: List[Dict[str, Any]] = Field(default_factory=list)
    engine_name: str
    language: str = "eng"
    source_layer: str = "text_layer"  # "text_layer" or "ocr"
    mean_confidence: float = 1.0


class OCRExtractResult(BaseModel):
    status: str = "success"  # "success" or "ocr_unavailable"
    status_message: Optional[str] = None
    filename: str
    total_pages: int = 1
    pages: List[PageOCRResult] = Field(default_factory=list)
    full_text: str = ""
    engine_name: str = "PyMuPDF text layer"
    language: str = "eng"
    mean_confidence: float = 1.0
    is_ocr: bool = False
    source_layer: str = "text_layer"  # "text_layer", "ocr", or "mixed"


class BaseOCREngine(ABC):
    name: str = "BaseOCREngine"
    is_available: bool = False

    @abstractmethod
    def extract_page(
        self,
        image_or_page: Any,
        page_number: int = 1,
        width: Optional[int] = None,
        height: Optional[int] = None
    ) -> PageOCRResult:
        """Extract text and word boxes from a rendered image or PDF page."""
        pass

