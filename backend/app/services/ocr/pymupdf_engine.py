"""
PyMuPDF Text Layer Engine:
Extracts embedded digital text and vector word boxes directly from PDFs.
Used when PDF page has a real embedded text layer (fast, deterministic, 99%+ confidence).
"""
import logging
from typing import Any, List, Dict, Optional
from backend.app.services.ocr.base import BaseOCREngine, PageOCRResult, WordBox

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

logger = logging.getLogger("pymupdf_engine")


class PyMuPDFTextEngine(BaseOCREngine):
    name = "PyMuPDF text layer"

    def __init__(self):
        self.is_available = fitz is not None

    def has_text_layer(self, fitz_page: Any) -> bool:
        """Determines whether a PDF page contains embedded digital text."""
        if not fitz_page:
            return False
        try:
            text = fitz_page.get_text("text").strip()
            # Require at least 15 non-whitespace chars to consider it a real digital text layer
            return len(text) >= 15
        except Exception:
            return False

    def extract_page(
        self,
        fitz_page: Any,
        page_number: int = 1,
        width: Optional[int] = None,
        height: Optional[int] = None
    ) -> PageOCRResult:
        """Extracts word boxes and text lines from PyMuPDF page object."""
        if not self.is_available or fitz_page is None:
            raise RuntimeError("PyMuPDF engine unavailable or page is None")

        p_width = int(fitz_page.rect.width) if width is None else width
        p_height = int(fitz_page.rect.height) if height is None else height

        word_boxes: List[WordBox] = []
        lines: List[Dict[str, Any]] = []
        text_lines: List[str] = []

        # 1. Word extraction: (x0, y0, x1, y1, word, block_no, line_no, word_no)
        try:
            raw_words = fitz_page.get_text("words")
            for w in raw_words:
                if len(w) >= 5 and str(w[4]).strip():
                    word_boxes.append(WordBox(
                        text=str(w[4]).strip(),
                        x0=float(w[0]),
                        y0=float(w[1]),
                        x1=float(w[2]),
                        y1=float(w[3]),
                        confidence=0.99
                    ))
        except Exception as e:
            logger.debug(f"PyMuPDF word extraction fallback: {e}")

        # 2. Block extraction: (x0, y0, x1, y1, text, block_no, block_type)
        try:
            blocks = fitz_page.get_text("blocks")
            for b in blocks:
                if len(b) >= 5 and str(b[4]).strip():
                    block_text = str(b[4]).strip()
                    lines.append({
                        "text": block_text,
                        "confidence": 0.99,
                        "bounding_box": [int(b[1]), int(b[0]), int(b[3]), int(b[2])],
                        "word_boxes": [
                            {"text": wb.text, "confidence": wb.confidence, "box": [wb.x0, wb.y0, wb.x1, wb.y1]}
                            for wb in word_boxes
                            if wb.y0 >= b[1] - 5 and wb.y1 <= b[3] + 5 and wb.x0 >= b[0] - 5 and wb.x1 <= b[2] + 5
                        ]
                    })
                    text_lines.append(block_text)
        except Exception as e:
            logger.debug(f"PyMuPDF block extraction fallback: {e}")

        full_text = "\n".join(text_lines) if text_lines else fitz_page.get_text("text").strip()

        return PageOCRResult(
            page_number=page_number,
            width=p_width,
            height=p_height,
            text=full_text,
            word_boxes=word_boxes,
            lines=lines,
            engine_name=self.name,
            language="eng",
            source_layer="text_layer",
            mean_confidence=0.99
        )

