import io
from pathlib import Path

from pypdf import PdfReader

from app.services.pdf_generator import generate_pdf_from_template

OUTPUT_DIR = Path(__file__).parent / "output"


def test_rirekisho_pdf_generation():
    """Verify 履歴書 template generates a valid PDF with embedded fonts."""
    pdf_bytes = generate_pdf_from_template("rirekisho.html")
    assert pdf_bytes is not None
    assert len(pdf_bytes) > 10_000, (
        f"PDF too small ({len(pdf_bytes)} bytes) -- fonts likely not embedded"
    )
    assert pdf_bytes[:5] == b"%PDF-", "Output is not a valid PDF"

    OUTPUT_DIR.mkdir(exist_ok=True)
    output_path = OUTPUT_DIR / "rirekisho_test.pdf"
    output_path.write_bytes(pdf_bytes)
    print(f"Rirekisho PDF: {len(pdf_bytes):,} bytes -> {output_path}")


def test_shokumukeirekisho_pdf_generation():
    """Verify 職務経歴書 template generates a valid PDF with embedded fonts."""
    pdf_bytes = generate_pdf_from_template("shokumukeirekisho.html")
    assert pdf_bytes is not None
    assert len(pdf_bytes) > 10_000, (
        f"PDF too small ({len(pdf_bytes)} bytes) -- fonts likely not embedded"
    )
    assert pdf_bytes[:5] == b"%PDF-", "Output is not a valid PDF"

    OUTPUT_DIR.mkdir(exist_ok=True)
    output_path = OUTPUT_DIR / "shokumukeirekisho_test.pdf"
    output_path.write_bytes(pdf_bytes)
    print(f"Shokumukeirekisho PDF: {len(pdf_bytes):,} bytes -> {output_path}")


def test_pdf_contains_multiple_pages_rirekisho():
    """Verify 履歴書 PDF has at least 2 pages (personal info + licenses/motivation)."""
    pdf_bytes = generate_pdf_from_template("rirekisho.html")
    reader = PdfReader(io.BytesIO(pdf_bytes))
    page_count = len(reader.pages)
    assert page_count >= 2, f"Expected at least 2 pages, got {page_count}"
    print(f"Rirekisho page count: {page_count}")
