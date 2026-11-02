# PRAMAAN-X Pluggable OCR Layer Setup & Architecture

## 1. Architecture Overview

PRAMAAN-X features a resilient 3-tier pluggable OCR pipeline located at `backend/app/services/ocr/`. Documents (digital PDFs, scanned image PDFs, PNG, JPG) are routed dynamically through the following hierarchy:

1. **PyMuPDF Text Layer (`PyMuPDF text layer`)**:
   - Used for digital PDFs with real embedded vector text.
   - Near instantaneous extraction (~15ms) with high confidence (99.0%).
   - Preserves exact word bounding boxes, font metadata, and line geometry.

2. **Tesseract OCR (`Tesseract 5.x (eng+hin)`)**:
   - Primary optical engine for scanned pages when the native Tesseract binary is present.
   - Automatically detected from:
     - `TESSERACT_PATH` / `TESSERACT_CMD` environment variables.
     - System `PATH` (`where tesseract` / `shutil.which`).
     - Standard Windows path: `C:\Program Files\Tesseract-OCR\tesseract.exe`.
   - Supports multi-script regulatory verification (`eng+hin`, plus `kan` and `tam` if language data is installed).

3. **RapidOCR (`RapidOCR`)**:
   - High-accuracy neural ONNX runtime engine requiring **zero external system binaries**.
   - Fully pip-installable fallback for environments without administrative install permissions.
   - Handles English and Devanagari/Hindi scripts out of the box with word-level bounding boxes.

4. **Fail-Safe Integrity (`ocr_unavailable`)**:
   - If a scan or image document is ingested and no OCR engine is installed on the host, the pipeline returns status `ocr_unavailable`.
   - **Never returns empty fields silently and never fabricates mock text.**
   - Informs scrutiny officers with a clear system banner and directs dossier to Manual Review.

---

## 2. Installation on Windows

### Option A: RapidOCR (Installed & Active on this Host)

RapidOCR is installed in the project virtual environment. No system installer or admin rights are required.

```powershell
.\.venv\Scripts\pip.exe install rapidocr-onnxruntime==1.4.4 onnxruntime==1.31.1 pyclipper==1.4.0
```

### Option B: Tesseract 5.x for Windows (Optional System Binary)

To enable Tesseract OCR as the primary local binary engine:

1. **Download the Windows Installer**:
   - Official UB-Mannheim Build: [https://github.com/UB-Mannheim/tesseract/wiki](https://github.com/UB-Mannheim/tesseract/wiki)
   - Download `tesseract-ocr-w64-setup-5.4.0.20240606.exe` (or latest 5.x version).

2. **Run Installer**:
   - Standard destination directory: `C:\Program Files\Tesseract-OCR\`
   - Check the box for "Additional script data" or "Additional language data" if prompted.

3. **Install Hindi & Regional Language Data (`traineddata`)**:
   - Download the fast or best models from official GitHub:
     - Hindi: [https://github.com/tesseract-ocr/tessdata_fast/raw/main/hin.traineddata](https://github.com/tesseract-ocr/tessdata_fast/raw/main/hin.traineddata)
     - Kannada: [https://github.com/tesseract-ocr/tessdata_fast/raw/main/kan.traineddata](https://github.com/tesseract-ocr/tessdata_fast/raw/main/kan.traineddata)
     - Tamil: [https://github.com/tesseract-ocr/tessdata_fast/raw/main/tam.traineddata](https://github.com/tesseract-ocr/tessdata_fast/raw/main/tam.traineddata)
   - Place downloaded `.traineddata` files into:
     ```
     C:\Program Files\Tesseract-OCR\tessdata\
     ```

4. **Set Environment Variable (Optional)**:
   - If installed in a non-standard location, set `TESSERACT_PATH`:
     ```powershell
     [System.Environment]::SetEnvironmentVariable("TESSERACT_PATH", "C:\Program Files\Tesseract-OCR\tesseract.exe", "Machine")
     ```

---

## 3. Image Preprocessing Pipeline

Scanned PDF pages and images pass through an OpenCV preprocessing pipeline (`backend/app/services/ocr/preprocessing.py`) prior to OCR execution:
- **Grayscale Conversion**: Normalizes color depth across scanners.
- **Skew Correction (Deskew)**: Detects document tilt angle via `cv2.minAreaRect` on Otsu-thresholded text pixels and realigns tilted scans.
- **Contrast Optimization (CLAHE)**: Enhances faded stamps, low-contrast seal text, and faint dot-matrix printer characters.

Controlled programmatically via `preprocess=True` (default).

---

## 4. Verification

Test the active engines on this host using Python:

```powershell
.\.venv\Scripts\python.exe -c "from backend.app.services.ocr import ocr_service; print('Available engines:', ocr_service.get_available_engines())"
```

