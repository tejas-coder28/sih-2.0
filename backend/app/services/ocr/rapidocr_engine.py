"""
RapidOCR Engine via rapidocr-onnxruntime:
Lightweight deep-learning OCR with zero external system binaries required.
Provides bilingual English + Hindi/Devanagari text extraction with word & line bounding boxes.
"""
import logging
from typing import Any, List, Dict, Optional
import numpy as np
from PIL import Image

from backend.app.services.ocr.base import BaseOCREngine, PageOCRResult, WordBox

try:
    from rapidocr_onnxruntime import RapidOCR
    _rapid_instance = RapidOCR()
except Exception as e:
    _rapid_instance = None

logger = logging.getLogger("rapidocr_engine")


class RapidOCREngine(BaseOCREngine):
    name = "RapidOCR"

    def __init__(self):
        self.is_available = _rapid_instance is not None
        self._engine = _rapid_instance
        self.language = "eng+hin"
        if self.is_available:
            logger.info("RapidOCR initialized successfully via rapidocr-onnxruntime.")
        else:
            logger.debug("RapidOCR is not available.")

    def extract_page(
        self,
        image: Any,
        page_number: int = 1,
        width: Optional[int] = None,
        height: Optional[int] = None
    ) -> PageOCRResult:
        if not self.is_available or self._engine is None:
            raise RuntimeError("RapidOCR engine is not installed or available.")

        if isinstance(image, Image.Image):
            np_img = np.array(image)
        elif isinstance(image, np.ndarray):
            np_img = image
        else:
            raise ValueError(f"Unsupported image type: {type(image)}")

        p_height, p_width = np_img.shape[:2]
        if width:
            p_width = width
        if height:
            p_height = height

        word_boxes: List[WordBox] = []
        lines: List[Dict[str, Any]] = []
        scores: List[float] = []
        text_lines: List[str] = []

        try:
            result, _elapse = self._engine(np_img)
        except Exception as e:
            logger.error(f"RapidOCR execution failed: {e}")
            result = None

        if result:
            for item in result:
                if not item or len(item) < 3:
                    continue
                box, text, score = item[0], str(item[1]).strip(), float(item[2])
                if not text:
                    continue

                scores.append(score)
                text_lines.append(text)

                ymin = float(min(pt[1] for pt in box))
                xmin = float(min(pt[0] for pt in box))
                ymax = float(max(pt[1] for pt in box))
                xmax = float(max(pt[0] for pt in box))

                words = text.split()
                line_word_boxes = []

                if len(words) <= 1:
                    wb = WordBox(text=text, x0=xmin, y0=ymin, x1=xmax, y1=ymax, confidence=round(score, 3))
                    word_boxes.append(wb)
                    line_word_boxes.append({"text": text, "confidence": round(score, 3), "box": [xmin, ymin, xmax, ymax]})
                else:
                    # Allocate horizontal box width proportionally by word length
                    total_chars = max(1, sum(len(w) for w in words))
                    cur_x = xmin
                    total_w = max(1.0, xmax - xmin)

                    for w in words:
                        w_len = len(w)
                        w_width = total_w * (w_len / total_chars)
                        wb = WordBox(
                            text=w,
                            x0=round(cur_x, 1),
                            y0=round(ymin, 1),
                            x1=round(cur_x + w_width, 1),
                            y1=round(ymax, 1),
                            confidence=round(score, 3)
                        )
                        word_boxes.append(wb)
                        line_word_boxes.append({
                            "text": w,
                            "confidence": round(score, 3),
                            "box": [round(cur_x, 1), round(ymin, 1), round(cur_x + w_width, 1), round(ymax, 1)]
                        })
                        cur_x += w_width

                lines.append({
                    "text": text,
                    "confidence": round(score, 3),
                    "bounding_box": [int(ymin), int(xmin), int(ymax), int(xmax)],
                    "word_boxes": line_word_boxes
                })

        mean_conf = round(sum(scores) / len(scores), 3) if scores else 0.0

        return PageOCRResult(
            page_number=page_number,
            width=p_width,
            height=p_height,
            text="\n".join(text_lines),
            word_boxes=word_boxes,
            lines=lines,
            engine_name=self.name,
            language=self.language,
            source_layer="ocr",
            mean_confidence=mean_conf
        )

