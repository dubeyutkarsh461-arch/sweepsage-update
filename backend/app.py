"""
SweepSage Fallback Gateway
Compatible with Vercel deployment (avoids FASTAPI_ENTRYPOINT_NOT_FOUND error).
The frontend runs entirely client-side via catalog.js and localStorage.
"""
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(title="SweepSage Gateway", version="2.0.0")

@app.get("/api/health")
def health_check():
    return JSONResponse({
        "status": "healthy",
        "service": "SweepSage",
        "frontend": "static",
        "crm": "active"
    })
