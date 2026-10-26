import os
import sys
import uvicorn
from pathlib import Path

# Fix Windows console UTF-8 output if possible
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure backend package can be imported
CURRENT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(CURRENT_DIR))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")

    print("=========================================================")
    print(" SWEEPSAGE BACKEND & APPLICATION SERVER")
    print("=========================================================")
    print(f" Website & App:     http://{host}:{port}/")
    print(f" API Documentation: http://{host}:{port}/docs")
    print(f" Redoc Specs:       http://{host}:{port}/redoc")
    print(f" Admin Portal:      http://{host}:{port}/admin.html")
    print(f" SQLite Database:   {CURRENT_DIR / 'sweepsage.db'}")
    print("=========================================================")
    print("Starting server... (Press Ctrl+C to stop)")

    uvicorn.run("backend.app:app", host=host, port=port, reload=True)
