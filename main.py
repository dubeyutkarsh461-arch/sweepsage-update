"""
SweepSage Root Application Entry Point
Exposes the complete FastAPI application from backend/app.py.
"""
from backend.app import app

__all__ = ["app"]
