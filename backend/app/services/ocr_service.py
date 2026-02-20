"""OCR service for processing image-based/scanned PDFs using Tesseract."""

import asyncio
import logging

logger = logging.getLogger(__name__)


class OCRError(Exception):
    """Raised when OCR processing fails."""

    pass


class OCRService:
    """Service for detecting and processing image-based PDFs via Tesseract OCR."""

    # Text length threshold for detecting image-based PDFs
    TEXT_THRESHOLD = 100
    # Maximum file size for OCR processing (5 MB)
    MAX_FILE_SIZE = 5 * 1024 * 1024
    # OCR timeout in seconds
    OCR_TIMEOUT = 30
    # Languages for OCR: Chinese Simplified, Chinese Traditional, Japanese, English
    OCR_LANGUAGES = "chi_sim+chi_tra+jpn+eng"

    def is_image_based(self, text: str) -> bool:
        """Check if extracted text indicates an image-based PDF.

        Args:
            text: Text extracted from the PDF.

        Returns:
            True if text length is below threshold, indicating image-based PDF.
        """
        text_length = len(text.strip())
        is_image = text_length < self.TEXT_THRESHOLD
        if is_image:
            logger.info(
                "PDF classified as image-based: extracted %d chars < %d threshold",
                text_length,
                self.TEXT_THRESHOLD,
            )
        return is_image

    def _validate_file_size(self, content: bytes) -> None:
        """Validate file size for OCR processing.

        Args:
            content: PDF file bytes.

        Raises:
            OCRError: If file exceeds the size limit.
        """
        if len(content) > self.MAX_FILE_SIZE:
            raise OCRError("File exceeds 5MB limit for OCR processing")

    def _run_ocr_sync(self, content: bytes) -> str:
        """Run OCR synchronously (called via asyncio.to_thread).

        Args:
            content: PDF file bytes.

        Returns:
            Extracted text from all pages.

        Raises:
            OCRError: If OCR fails for any reason.
        """
        try:
            from pdf2image import convert_from_bytes
            import pytesseract
        except ImportError as e:
            missing_pkg = str(e).split("'")[-2] if "'" in str(e) else "required package"
            raise OCRError(f"OCR dependencies not installed: {missing_pkg}") from e

        try:
            # Convert PDF pages to images
            images = convert_from_bytes(content, dpi=200)
        except Exception as e:
            error_msg = str(e).lower()
            if "pdfinfo" in error_msg or "poppler" in error_msg:
                raise OCRError("PDF utilities not installed") from e
            raise OCRError(f"PDF to image conversion failed: {e}") from e

        # Process each page with OCR
        page_texts: list[str] = []
        for i, image in enumerate(images):
            try:
                text = pytesseract.image_to_string(image, lang=self.OCR_LANGUAGES)
                page_texts.append(text.strip())
            except Exception as e:
                error_msg = str(e).lower()
                if "tesseract" in error_msg and "not installed" in error_msg:
                    raise OCRError("OCR engine not installed") from e
                logger.warning("OCR failed for page %d: %s", i + 1, e)
                page_texts.append("")  # Continue with empty text for this page

        return "\n\n".join(page_texts).strip()

    async def process_pdf(self, content: bytes, extracted_text: str) -> str:
        """Process a PDF, running OCR if it's image-based.

        Args:
            content: PDF file bytes.
            extracted_text: Text already extracted from the PDF.

        Returns:
            OCR text if image-based, otherwise the original extracted text.

        Raises:
            OCRError: If OCR processing fails or times out.
        """
        # If not image-based, return original text
        if not self.is_image_based(extracted_text):
            return extracted_text

        # Validate file size before OCR
        self._validate_file_size(content)

        logger.info("Starting OCR processing for image-based PDF")

        try:
            # Run OCR in a thread pool with timeout
            ocr_text = await asyncio.wait_for(
                asyncio.to_thread(self._run_ocr_sync, content),
                timeout=self.OCR_TIMEOUT,
            )

            logger.info("OCR completed, extracted %d characters", len(ocr_text))
            return ocr_text

        except asyncio.TimeoutError as e:
            logger.error("OCR processing timed out after %d seconds", self.OCR_TIMEOUT)
            raise OCRError("OCR processing timed out") from e
        except OCRError:
            # Re-raise OCRError as-is
            raise
        except Exception as e:
            logger.error("OCR failed: %s", e)
            raise OCRError(f"OCR failed: {e}") from e
