import logging
import os
import sys
from pathlib import Path

# On Windows, Python 3.8+ requires os.add_dll_directory for native library resolution.
# WeasyPrint depends on GTK/Pango/Cairo from MSYS2 ucrt64.
if sys.platform == "win32":
    _msys2_bin = Path(r"C:\msys64\ucrt64\bin")
    if _msys2_bin.is_dir():
        os.add_dll_directory(str(_msys2_bin))
    _fontconfig = Path(r"C:\msys64\ucrt64\etc\fonts\fonts.conf")
    if _fontconfig.is_file() and "FONTCONFIG_FILE" not in os.environ:
        os.environ["FONTCONFIG_FILE"] = str(_fontconfig)

from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

from app.config import FONTS_DIR, TEMPLATES_DIR

logger = logging.getLogger(__name__)


def _normalize_path_for_url(path: Path) -> str:
    """Convert a Path to a file:// URL with forward slashes (required on Windows)."""
    absolute = path.resolve()
    return absolute.as_posix()


def generate_pdf(html_content: str, base_css_path: Path | None = None) -> bytes:
    """Render HTML content to PDF bytes with embedded Noto Sans JP CJK fonts.

    Args:
        html_content: The HTML string to render.
        base_css_path: Optional path to a base CSS file. Defaults to TEMPLATES_DIR/base.css.

    Returns:
        PDF file contents as bytes.
    """
    font_config = FontConfiguration()

    regular_path = _normalize_path_for_url(FONTS_DIR / "NotoSansJP-Regular.ttf")
    bold_path = _normalize_path_for_url(FONTS_DIR / "NotoSansJP-Bold.ttf")

    font_css = CSS(string=f"""
        @font-face {{
            font-family: 'Noto Sans JP';
            font-weight: 400;
            src: url('file:///{regular_path}');
        }}
        @font-face {{
            font-family: 'Noto Sans JP';
            font-weight: 700;
            src: url('file:///{bold_path}');
        }}
    """, font_config=font_config)

    stylesheets = [font_css]

    if base_css_path is None:
        base_css_path = TEMPLATES_DIR / "base.css"
    if base_css_path.exists():
        base_css = CSS(filename=str(base_css_path), font_config=font_config)
        stylesheets.insert(0, base_css)

    html = HTML(string=html_content)

    try:
        pdf_bytes = html.write_pdf(
            stylesheets=stylesheets,
            font_config=font_config,
        )
    except Exception:
        logger.exception("WeasyPrint PDF generation failed")
        raise

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
