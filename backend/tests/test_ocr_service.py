"""Unit tests for OCRService."""

import pytest

from app.services.ocr_service import OCRError, OCRService


class TestOCRServiceInit:
    """Tests for OCRService initialization."""

    def test_ocr_service_constants(self):
        """Verify OCR service constants are set correctly."""
        assert OCRService.TEXT_THRESHOLD == 100
        assert OCRService.MAX_FILE_SIZE == 5 * 1024 * 1024  # 5MB
        assert OCRService.OCR_TIMEOUT == 30
        assert "chi_sim" in OCRService.OCR_LANGUAGES
        assert "jpn" in OCRService.OCR_LANGUAGES


class TestIsImageBased:
    """Tests for the is_image_based detection method."""

    def test_is_image_based_returns_true_for_empty_string(self):
        """Empty string should be classified as image-based."""
        service = OCRService()
        assert service.is_image_based("") is True

    def test_is_image_based_returns_true_for_whitespace_only(self):
        """Whitespace-only string should be classified as image-based."""
        service = OCRService()
        assert service.is_image_based("   ") is True
        assert service.is_image_based("\n\n") is True
        assert service.is_image_based("\t\t") is True

    def test_is_image_based_returns_true_for_short_text(self):
        """Text below threshold (100 chars) should be image-based."""
        service = OCRService()
        assert service.is_image_based("short") is True
        assert service.is_image_based("a" * 50) is True
        assert service.is_image_based("a" * 99) is True

    def test_is_image_based_returns_false_for_long_text(self):
        """Text at or above threshold should not be image-based."""
        service = OCRService()
        assert service.is_image_based("a" * 100) is False
        assert service.is_image_based("a" * 200) is False
        assert service.is_image_based("a" * 500) is False

    def test_is_image_based_returns_false_for_exact_threshold(self):
        """Text exactly at threshold (100 chars) should not be image-based."""
        service = OCRService()
        # Exactly 100 characters after strip
        text = "a" * 100
        assert len(text.strip()) == 100
        assert service.is_image_based(text) is False

    def test_is_image_based_strips_whitespace(self):
        """Whitespace should be stripped before checking length."""
        service = OCRService()
        # 99 chars + 10 spaces = 109 chars total, but 99 after strip
        assert service.is_image_based("a" * 99 + " " * 10) is True
        # 100 chars + 10 spaces = 110 chars total, but 100 after strip
        assert service.is_image_based("a" * 100 + " " * 10) is False


class TestValidateFileSize:
    """Tests for the _validate_file_size method."""

    def test_validate_file_size_accepts_small_file(self):
        """Files under the limit should not raise an error."""
        service = OCRService()
        small_content = b"x" * 1024  # 1KB
        # Should not raise
        service._validate_file_size(small_content)

    def test_validate_file_size_accepts_exact_limit(self):
        """File exactly at limit should not raise an error."""
        service = OCRService()
        exact_limit_content = b"x" * OCRService.MAX_FILE_SIZE
        # Should not raise
        service._validate_file_size(exact_limit_content)

    def test_validate_file_size_rejects_oversized_file(self):
        """Files over the limit should raise OCRError."""
        service = OCRService()
        large_content = b"x" * (6 * 1024 * 1024)  # 6MB
        with pytest.raises(OCRError, match="exceeds 5MB"):
            service._validate_file_size(large_content)

    def test_validate_file_size_rejects_one_byte_over(self):
        """Even 1 byte over limit should raise OCRError."""
        service = OCRService()
        over_limit_content = b"x" * (OCRService.MAX_FILE_SIZE + 1)
        with pytest.raises(OCRError, match="exceeds 5MB"):
            service._validate_file_size(over_limit_content)


class TestProcessPdf:
    """Tests for the process_pdf async method."""

    @pytest.mark.asyncio
    async def test_process_pdf_returns_original_for_text_based(self):
        """Text-based PDFs should return original text without OCR."""
        service = OCRService()
        long_text = "a" * 200
        result = await service.process_pdf(b"fake pdf content", long_text)
        assert result == long_text

    @pytest.mark.asyncio
    async def test_process_pdf_returns_original_at_threshold(self):
        """PDF at threshold should return original text without OCR."""
        service = OCRService()
        threshold_text = "a" * 100
        result = await service.process_pdf(b"fake pdf content", threshold_text)
        assert result == threshold_text

    @pytest.mark.asyncio
    async def test_process_pdf_rejects_oversized_file(self):
        """Image-based PDFs over size limit should raise OCRError."""
        service = OCRService()
        short_text = "short"  # Below threshold, triggers OCR path
        large_content = b"x" * (6 * 1024 * 1024)  # 6MB
        with pytest.raises(OCRError, match="exceeds 5MB"):
            await service.process_pdf(large_content, short_text)

    @pytest.mark.asyncio
    async def test_process_pdf_small_text_based_file_skips_validation(self):
        """Small text-based PDFs skip file size validation."""
        service = OCRService()
        long_text = "a" * 200  # Text-based, skips OCR entirely
        # Even though content is large, we skip OCR validation
        large_content = b"x" * (6 * 1024 * 1024)  # 6MB
        result = await service.process_pdf(large_content, long_text)
        assert result == long_text


class TestOCRError:
    """Tests for the OCRError exception class."""

    def test_ocr_error_message(self):
        """OCRError should preserve the error message."""
        error = OCRError("Test error message")
        assert str(error) == "Test error message"

    def test_ocr_error_inheritance(self):
        """OCRError should inherit from Exception."""
        error = OCRError("Test error")
        assert isinstance(error, Exception)

    def test_ocr_error_file_size_message(self):
        """OCRError should handle file size messages."""
        error = OCRError("File exceeds 5MB limit for OCR processing")
        assert "5MB" in str(error)

    def test_ocr_error_timeout_message(self):
        """OCRError should handle timeout messages."""
        error = OCRError("OCR processing timed out")
        assert "timed out" in str(error)

    def test_ocr_error_not_installed_message(self):
        """OCRError should handle not installed messages."""
        error = OCRError("OCR engine not installed")
        assert "not installed" in str(error)


# Tests that require actual Tesseract installation are marked to skip
@pytest.mark.skip(reason="Requires Tesseract and poppler to be installed")
class TestOCRIntegration:
    """Integration tests that require actual OCR dependencies."""

    @pytest.mark.asyncio
    async def test_process_pdf_runs_ocr_for_image_based(self):
        """Image-based PDFs should trigger OCR processing."""
        # This test requires Tesseract and poppler-utils to be installed
        # Skip in CI/CD environments without these dependencies
        pass

    @pytest.mark.asyncio
    async def test_ocr_timeout_raises_error(self):
        """OCR processing should timeout after configured duration."""
        # This test requires a slow OCR operation to test timeout
        pass
