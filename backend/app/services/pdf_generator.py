import logging
from pathlib import Path

from playwright.sync_api import sync_playwright

from app.config import TEMPLATES_DIR

logger = logging.getLogger(__name__)


def generate_pdf(html_content: str, base_css_path: Path | None = None) -> bytes:
    """Render HTML content to PDF bytes using Playwright headless Chrome.

    Args:
        html_content: The HTML string to render.
        base_css_path: Optional path to a base CSS file (ignored - CSS should be in HTML).

    Returns:
        PDF file contents as bytes.
    """
    if base_css_path is None:
        base_css_path = TEMPLATES_DIR / "base.css"

    if base_css_path.exists():
        css_content = base_css_path.read_text(encoding="utf-8")
        html_with_css = f"<style>{css_content}</style>{html_content}"
    else:
        html_with_css = html_content

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_content(html_with_css)

        try:
            pdf_bytes = page.pdf(
                format="A4",
                print_background=True,
            )
        except Exception:
            logger.exception("Playwright PDF generation failed")
            raise
        finally:
            browser.close()

    return pdf_bytes


def generate_pdf_from_template(template_name: str) -> bytes:
    """Read an HTML template file and render it to PDF.

    Args:
        template_name: Filename of the template (e.g. "rirekisho.html").

    Returns:
        PDF file contents as bytes.
    """
    template_path = TEMPLATES_DIR / template_name
    html_content = template_path.read_text(encoding="utf-8")
    base_css_path = TEMPLATES_DIR / "base.css"
    return generate_pdf(html_content, base_css_path=base_css_path)
