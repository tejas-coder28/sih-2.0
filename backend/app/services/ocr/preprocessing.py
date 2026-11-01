"""
OpenCV Image Preprocessing for OCR:
Includes grayscale conversion, contrast enhancement (CLAHE), and skew correction.
Controlled behind a flag: preprocess=True/False.
"""
import logging
from typing import Union
import numpy as np
from PIL import Image

try:
    import cv2
except ImportError:
    cv2 = None

logger = logging.getLogger("ocr_preprocessing")


def deskew_image(gray: np.ndarray) -> np.ndarray:
    """
    Detects document orientation skew and rotates back to horizontal axis.
    Uses cv2.minAreaRect on thresholded text pixels.
    """
    if cv2 is None:
        return gray

    try:
        # Invert: text becomes white, background black
        thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
        coords = np.column_stack(np.where(thresh > 0))
        if len(coords) < 50:
            return gray

        # Compute minimum bounding rectangle
        angle = cv2.minAreaRect(coords)[-1]

        # OpenCV minAreaRect returns angle in [-90, 0)
        if angle < -45.0:
            angle = -(90.0 + angle)
        else:
            angle = -angle

        # Only deskew if meaningful tilt (< 45 degrees, > 0.5 degrees)
        if abs(angle) > 0.5 and abs(angle) < 45.0:
            (h, w) = gray.shape[:2]
            center = (w // 2, h // 2)
            rot_mat = cv2.getRotationMatrix2D(center, angle, 1.0)
            rotated = cv2.warpAffine(
                gray, rot_mat, (w, h),
                flags=cv2.INTER_CUBIC,
                borderMode=cv2.BORDER_CONSTANT,
                borderValue=255
            )
            return rotated
    except Exception as e:
        logger.debug(f"Deskew failed: {e}")

    return gray


def enhance_contrast(gray: np.ndarray) -> np.ndarray:
    """Enhances text contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)."""
    if cv2 is None:
        return gray

    try:
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        return clahe.apply(gray)
    except Exception as e:
        logger.debug(f"Contrast enhancement failed: {e}")
        return gray


def preprocess_image(
    image: Union[np.ndarray, Image.Image],
    grayscale: bool = True,
    contrast: bool = True,
    deskew: bool = True
) -> np.ndarray:
    """
    Preprocesses image for OCR pipeline:
    1. Grayscale
    2. Deskew
    3. Contrast adjustment (CLAHE)
    Returns uint8 numpy array (BGR/RGB or single-channel).
    """
    if isinstance(image, Image.Image):
        np_img = np.array(image)
    else:
        np_img = image.copy()

    if cv2 is None:
        return np_img

    # Convert to grayscale if requested
    if grayscale:
        if len(np_img.shape) == 3 and np_img.shape[2] == 3:
            gray = cv2.cvtColor(np_img, cv2.COLOR_RGB2GRAY)
        elif len(np_img.shape) == 3 and np_img.shape[2] == 4:
            gray = cv2.cvtColor(np_img, cv2.COLOR_RGBA2GRAY)
        else:
            gray = np_img.copy()
    else:
        gray = np_img

    if deskew and len(gray.shape) == 2:
        gray = deskew_image(gray)

    if contrast and len(gray.shape) == 2:
        gray = enhance_contrast(gray)

    # Return 3-channel RGB for neural OCR engines expecting 3-channels
    if len(gray.shape) == 2:
        return cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)

    return gray

