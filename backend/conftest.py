import os
import sys
from pathlib import Path

if sys.platform == "win32":
    _msys2_bin = Path(r"C:\msys64\ucrt64\bin")
    if _msys2_bin.is_dir():
        os.add_dll_directory(str(_msys2_bin))
