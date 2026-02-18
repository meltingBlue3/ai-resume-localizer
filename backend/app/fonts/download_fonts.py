"""Download Noto Sans JP font files for PDF generation.

Run this script if font files are missing:
    python backend/app/fonts/download_fonts.py
"""

import urllib.request
import zipfile
import tempfile
from pathlib import Path

FONTS_DIR = Path(__file__).parent
GOOGLE_FONTS_URL = "https://github.com/google/fonts/raw/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf"

WEIGHTS = {
    400: "Regular",
    700: "Bold",
}


def download_fonts():
    regular = FONTS_DIR / "NotoSansJP-Regular.ttf"
    bold = FONTS_DIR / "NotoSansJP-Bold.ttf"

    if regular.exists() and bold.exists():
        print("Font files already exist. Skipping download.")
        return

    print("Downloading Noto Sans JP variable font...")
    variable_path = FONTS_DIR / "NotoSansJP-Variable.ttf"
    urllib.request.urlretrieve(GOOGLE_FONTS_URL, variable_path)
    print(f"Downloaded: {variable_path.stat().st_size // 1024} KB")

    try:
        from fontTools.ttLib import TTFont
        from fontTools.varLib.instancer import instantiateVariableFont

        for weight, name in WEIGHTS.items():
            font = TTFont(str(variable_path))
            instantiateVariableFont(font, {"wght": weight})
            out = FONTS_DIR / f"NotoSansJP-{name}.ttf"
            font.save(str(out))
            print(f"Created {name}: {out.stat().st_size // 1024} KB")
            font.close()
    finally:
        variable_path.unlink(missing_ok=True)

    print("Done! Font files ready for PDF generation.")


if __name__ == "__main__":
    download_fonts()
