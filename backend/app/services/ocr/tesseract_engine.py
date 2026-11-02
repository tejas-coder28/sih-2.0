"""
Tesseract OCR Engine via pytesseract:
Activated ONLY if the tesseract binary is physically present on the host.
Checks:
1. Environment variable TESSERACT_CMD or TESSERACT_PATH
2. System PATH via shutil.which('tesseract')
3. Standard Windows install path: C:\\Program Files\\Tesseract-OCR\\tesseract.exe
Configures languages eng+hin (plus kan and tam if traineddata present).
"""
import os
import shutil
import logging
from typing import Any, List, Dict, Optional, Tuple
from PIL import Image

from backend.app.services.ocr.base import BaseOCREngine, PageOCRResult, WordBox

try:
    import pytesseract
except ImportError:
    pytesseract = None

logger = logging.getLogger("tesseract_engine")


def find_tesseract_binary() -> Optional[str]:
    """Finds Tesseract executable across configured env vars, PATH, and default paths."""
    # 1. Configurable environment variables
    env_path = os.environ.get("TESSERACT_CMD") or os.environ.get("TESSERACT_PATH")
    if env_path and os.path.exists(env_path):
        return env_path

    # 2. System PATH
    which_path = shutil.which("tesseract")
    if which_path and os.path.exists(which_path):
        return which_path

    # 3. Standard Windows installation paths
    candidates = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c

    return None


class TesseractOCREngine(BaseOCREngine):
    def __init__(self):
        self.is_available = False
        self.binary_path = None
        self.version = "unknown"
        self.languages = "eng"
        self.name = "Tesseract OCR"

        if pytesseract is None:
            return

        bin_path = find_tesseract_binary()
        if not bin_path:
            return

        try:
            pytesseract.pytesseract.tesseract_cmd = bin_path
            # Check if tesseract is executable and query version
            v = str(pytesseract.get_tesseract_version()).strip()
            self.version = v
            self.binary_path = bin_path

            # Detect installed languages
            installed_langs = []
            try:
                installed_langs = pytesseract.get_languages()
            except Exception:
                installed_langs = ["eng"]

            active_langs = ["eng"]
            for opt_lang in ["hin", "kan", "tam"]:
                if opt_lang in installed_langs:
                    active_langs.append(opt_lang)

            self.languages = "+".join(active_langs)
            self.name = f"Tesseract {self.version} ({self.languages})"
            self.is_available = True
            logger.info(f"Tesseract OCR initialized: {self.name} at {bin_path}")
        except Exception as e:
            logger.warning(f"Tesseract binary detected at {bin_path} but failed verification: {e}")
            self.is_available = False

    def extract_page(
        self,
        image: Any,
        page_number: int = 1,
        width: Optional[int] = None,
        height: Optional[int] = None
    ) -> PageOCRResult:
        if not self.is_available or pytesseract is None:
            raise RuntimeError("Tesseract OCR binary is not installed or available.")

        if not isinstance(image, Image.Image):
            pil_img = Image.fromarray(image)
        else:
            pil_img = image

        p_width = width or pil_img.width
        p_height = height or pil_img.height

        data = pytesseract.image_to_data(pil_img, lang=self.languages, output_type=pytesseract.Output.DICT)
        n_boxes = len(data.get("text", []))

        word_boxes: List[WordBox] = []
        conf_values: List[float] = []
        line_map: Dict[Tuple[int, int, int], List[Dict[str, Any]]] = {}

        for i in range(n_boxes):
            w_text = str(data["text"][i]).strip()
            conf_raw = float(data["conf"][i])
            if not w_text or conf_raw < 0:
                continue

            conf = round(conf_raw / 100.0, 3)
            conf_values.append(conf)

            x = float(data["left"][i])
            y = float(data["top"][i])
            w = float(data["width"][i])
            h = float(data["height"][i])

            wb = WordBox(
                text=w_text,
                x0=x,
                y0=y,
                x1=x + w,
                y1=y + h,
                confidence=conf
            )
            word_boxes.append(wb)

            # Group words by block and line for line reconstruction
            key = (int(data["block_num"][i]), int(data["par_num"][i]), int(data["line_num"][i]))
            if key not in line_map:
                line_map[key] = []
            line_map[key].append({
                "text": w_text,
                "conf": conf,
                "x0": x,
                "y0": y,
                "x1": x + w,
                "y1": y + h
            })

        lines: List[Dict[str, Any]] = []
        full_text_lines: List[str] = []

        for key, w_list in line_map.items():
            if not w_list:
                continue
            line_text = " ".join(item["text"] for item in w_list)
            line_conf = round(sum(item["conf"] for item in w_list) / len(w_list), 3)
            ly0 = int(min(item["y0"] for item in w_list))
            lx0 = int(min(item["x0"] for item in w_list))
            ly1 = int(max(item["y1"] for item in w_list))
            lx1 = int(max(item["x1"] for item in w_list))

            lines.append({
                "text": line_text,
                "confidence": line_conf,
                "bounding_box": [ly0, lx0, ly1, lx1],
                "word_boxes": [
                    {"text": item["text"], "confidence": item["conf"], "box": [item["x0"], item["y0"], item["x1"], item["y1"]]}
                    for item in w_list
                ]
            })
            full_text_lines.append(line_text)

        mean_conf = round(sum(conf_values) / len(conf_values), 3) if conf_values else 0.0

        return PageOCRResult(
            page_number=page_number,
            width=p_width,
            height=p_height,
            text="\n".join(full_text_lines),
            word_boxes=word_boxes,
            lines=lines,
            engine_name=self.name,
            language=self.languages,
            source_layer="ocr",
            mean_confidence=mean_conf
        )

