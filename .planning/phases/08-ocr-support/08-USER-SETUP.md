# Phase 8: User Setup Required

**Generated:** 2026-02-20
**Phase:** 08-ocr-support
**Status:** Incomplete

Complete these items for the OCR integration to function. Claude automated everything possible; these items require installing system binaries.

## System Dependencies

OCR processing requires two system-level utilities that cannot be installed via pip/npm:

### Tesseract OCR Engine

- [ ] **Install Tesseract OCR binary**
  - **Windows:** Download from [UB Mannheim tesseract builds](https://github.com/UB-Mannheim/tesseract/wiki)
    - Download the latest installer (e.g., `tesseract-ocr-w64-setup-5.3.3.20231005.exe`)
    - Run installer, note the installation path (default: `C:\Program Files\Tesseract-OCR`)
    - Add Tesseract to PATH: System Properties → Environment Variables → Path → Add `C:\Program Files\Tesseract-OCR`
  - **macOS:** `brew install tesseract`
  - **Linux (Debian/Ubuntu):** `sudo apt install tesseract-ocr`

### Poppler Utilities (PDF to Image)

- [ ] **Install Poppler utilities**
  - **Windows:** Download from [poppler-windows releases](https://github.com/oschwartz10612/poppler-windows/releases)
    - Download latest release zip (e.g., `Release-24.02.0-0.zip`)
    - Extract to a folder (e.g., `C:\Program Files\poppler-24.02.0`)
    - Add to PATH: Add `C:\Program Files\poppler-24.02.0\Library\bin` to system PATH
  - **macOS:** `brew install poppler`
  - **Linux (Debian/Ubuntu):** `sudo apt install poppler-utils`

### Language Data

- [ ] **Install OCR language data**
  - Tesseract requires trained data files for each language
  - **Languages needed:** Chinese Simplified, Japanese, English
  - **Windows:**
    - Download from [tessdata repository](https://github.com/tesseract-ocr/tessdata)
    - Files needed: `chi_sim.traineddata`, `jpn.traineddata`, `eng.traineddata`
    - Copy to Tesseract tessdata folder (default: `C:\Program Files\Tesseract-OCR\tessdata`)
  - **macOS/Linux:** Usually included by default. If not:
    ```bash
    sudo apt install tesseract-ocr-chi-sim tesseract-ocr-chi-tra tesseract-ocr-jpn  # Linux
    brew install tesseract-lang  # macOS (installs all languages)
    ```

## Verification

After completing setup, verify with:

```bash
# Check Tesseract is installed
tesseract --version

# Check Poppler pdf2image is available (Windows uses pdf2image.py)
python -c "from pdf2image import convert_from_path; print('pdf2image OK')"

# Verify language data installed
tesseract --list-languages
# Should show: chi_sim, jpn, eng (and possibly others)

# Test OCR on a sample scanned PDF (from project root)
cd backend
python -c "
from app.services.ocr_service import OCRService
import asyncio
# This will fail gracefully if dependencies missing
service = OCRService()
print('OCRService initialized successfully')
"
```

Expected results:
- `tesseract --version` shows version 4.x or 5.x
- `tesseract --list-languages` includes chi_sim, jpn, eng
- Python import succeeds without errors

## Troubleshooting

### "TesseractNotFoundError"
- Tesseract binary not in PATH
- Windows: Verify PATH includes Tesseract installation folder
- Restart terminal/IDE after PATH changes

### "PDFInfoNotInstalledError"
- Poppler not in PATH
- Windows: Verify PATH includes poppler's `Library\bin` folder

### "Failed loading language"
- Language traineddata file missing
- Download required `.traineddata` files to tessdata directory

---

**Once all items complete:** Mark status as "Complete" at top of file.
