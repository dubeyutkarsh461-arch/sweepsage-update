from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(title="SweepSage")

@app.get("/api/health")
def health():
    return JSONResponse({"status": "ok", "app": "SweepSage"})
