"""
SweepSage Unified Backend & Database Engine
Supports SQLite persistent storage with FastAPI REST API endpoints.
Compatible with Vercel Serverless and Local Python environments.
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import json
import os
from pathlib import Path
from typing import Optional, Dict, Any, List

app = FastAPI(
    title="SweepSage Backend & Database",
    version="2.1.0",
    description="Unified API & SQLite Database for SweepSage Travel CRM, Destinations & Bookings"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database path resolution: use writable directory (compatible with local & Vercel /tmp)
BASE_DIR = Path(__file__).resolve().parent.parent
DB_DIR = Path("/tmp") if os.environ.get("VERCEL") else BASE_DIR
DB_PATH = DB_DIR / "sweepsage.db"

def get_db_connection():
    """Create thread-safe SQLite database connection."""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize SQLite database tables for CRM, Destinations, and Bookings."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # 1. Travel CRM Invoices & Itineraries
        cur.execute("""
        CREATE TABLE IF NOT EXISTS crm_invoices (
            id TEXT PRIMARY KEY,
            status TEXT DEFAULT 'Quotation Generated',
            client_name TEXT,
            client_phone TEXT,
            client_email TEXT,
            client_address TEXT,
            destination TEXT,
            trip_title TEXT,
            duration TEXT,
            start_date TEXT,
            end_date TEXT,
            travel_dates TEXT,
            adults INTEGER DEFAULT 2,
            children INTEGER DEFAULT 0,
            infants INTEGER DEFAULT 0,
            rooms INTEGER DEFAULT 1,
            guests_summary TEXT,
            hotel_category TEXT,
            meal_plan TEXT,
            hotel_names TEXT,
            vehicle_type TEXT,
            cab_scope TEXT,
            flight_status TEXT,
            itinerary_json TEXT,
            inclusions_json TEXT,
            exclusions_json TEXT,
            special_notes TEXT,
            advance_required TEXT,
            payment_terms TEXT,
            subtotal REAL DEFAULT 0,
            tax_percent REAL DEFAULT 5,
            tax_amount REAL DEFAULT 0,
            grand_total REAL DEFAULT 0,
            created_date TEXT,
            created_by TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 2. Travel Destinations & Catalog Packages
        cur.execute("""
        CREATE TABLE IF NOT EXISTS travel_destinations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            tag TEXT,
            duration TEXT,
            price TEXT,
            image TEXT,
            overview TEXT,
            itinerary_json TEXT,
            inclusions_json TEXT,
            active INTEGER DEFAULT 1,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 3. Customer Bookings Table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reference TEXT UNIQUE NOT NULL,
            service TEXT NOT NULL,
            package_name TEXT,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_email TEXT,
            location TEXT,
            price TEXT,
            status TEXT DEFAULT 'CONFIRMED',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 4. Registered CRM Coordinator Emails
        cur.execute("""
        CREATE TABLE IF NOT EXISTS crm_coordinators (
            email TEXT PRIMARY KEY,
            role TEXT DEFAULT 'Coordinator',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Seed founder email if empty
        cur.execute("INSERT OR IGNORE INTO crm_coordinators (email, role) VALUES ('dubeyutkarsh461@gmail.com', 'Founder');")

        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Database init notice: {e}")

# Run database table initialization
init_db()

@app.get("/api/health")
def health_check():
    """Health check endpoint showing active SQLite database connection."""
    return JSONResponse({
        "status": "healthy",
        "service": "SweepSage Unified Backend",
        "database": "SQLite (Active)",
        "db_path": str(DB_PATH),
        "crm": "ready"
    })

# -------------------------------------------------------------
# CRM INVOICES & TRAVEL PACKAGES API
# -------------------------------------------------------------

@app.get("/api/crm/invoices")
def get_all_crm_invoices():
    """Fetch all saved Travel CRM invoices and itineraries from SQLite database."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM crm_invoices ORDER BY updated_at DESC")
    rows = cur.fetchall()
    conn.close()

    result = []
    for r in rows:
        d = dict(r)
        d["itinerary"] = json.loads(d.get("itinerary_json") or "[]")
        d["inclusions"] = json.loads(d.get("inclusions_json") or "[]")
        d["exclusions"] = json.loads(d.get("exclusions_json") or "[]")
        result.append(d)
    return JSONResponse(result)

@app.post("/api/crm/invoices")
async def save_crm_invoice(request: Request):
    """Save or update a Travel CRM itinerary & invoice in SQLite database."""
    data = await request.json()
    inv_id = data.get("id")
    if not inv_id:
        raise HTTPException(status_code=400, detail="Invoice ID is required")

    itinerary_json = json.dumps(data.get("itinerary") or [])
    inclusions_json = json.dumps(data.get("inclusions") or [])
    exclusions_json = json.dumps(data.get("exclusions") or [])

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO crm_invoices (
        id, status, client_name, client_phone, client_email, client_address,
        destination, trip_title, duration, start_date, end_date, travel_dates,
        adults, children, infants, rooms, guests_summary, hotel_category, meal_plan,
        hotel_names, vehicle_type, cab_scope, flight_status, itinerary_json,
        inclusions_json, exclusions_json, special_notes, advance_required, payment_terms,
        subtotal, tax_percent, tax_amount, grand_total, created_date, created_by, updated_at
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
    )
    ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        client_name = excluded.client_name,
        client_phone = excluded.client_phone,
        client_email = excluded.client_email,
        client_address = excluded.client_address,
        destination = excluded.destination,
        trip_title = excluded.trip_title,
        duration = excluded.duration,
        start_date = excluded.start_date,
        end_date = excluded.end_date,
        travel_dates = excluded.travel_dates,
        adults = excluded.adults,
        children = excluded.children,
        infants = excluded.infants,
        rooms = excluded.rooms,
        guests_summary = excluded.guests_summary,
        hotel_category = excluded.hotel_category,
        meal_plan = excluded.meal_plan,
        hotel_names = excluded.hotel_names,
        vehicle_type = excluded.vehicle_type,
        cab_scope = excluded.cab_scope,
        flight_status = excluded.flight_status,
        itinerary_json = excluded.itinerary_json,
        inclusions_json = excluded.inclusions_json,
        exclusions_json = excluded.exclusions_json,
        special_notes = excluded.special_notes,
        advance_required = excluded.advance_required,
        payment_terms = excluded.payment_terms,
        subtotal = excluded.subtotal,
        tax_percent = excluded.tax_percent,
        tax_amount = excluded.tax_amount,
        grand_total = excluded.grand_total,
        updated_at = CURRENT_TIMESTAMP;
    """, (
        inv_id,
        data.get("status", "Quotation Generated"),
        data.get("clientName", ""),
        data.get("clientPhone", ""),
        data.get("clientEmail", ""),
        data.get("clientAddress", ""),
        data.get("destination", ""),
        data.get("tripTitle", ""),
        data.get("duration", ""),
        data.get("startDate", ""),
        data.get("endDate", ""),
        data.get("travelDates", ""),
        data.get("adults", 2),
        data.get("children", 0),
        data.get("infants", 0),
        data.get("rooms", 1),
        data.get("guestsSummary", ""),
        data.get("hotelCategory", ""),
        data.get("mealPlan", ""),
        data.get("hotelNames", ""),
        data.get("vehicleType", ""),
        data.get("cabScope", ""),
        data.get("flightStatus", ""),
        itinerary_json,
        inclusions_json,
        exclusions_json,
        data.get("specialNotes", ""),
        data.get("advanceRequired", ""),
        data.get("paymentTerms", ""),
        data.get("subtotal", 0),
        data.get("taxPercent", 5),
        data.get("taxAmount", 0),
        data.get("grandTotal", 0),
        data.get("createdDate", ""),
        data.get("createdBy", "dubeyutkarsh461@gmail.com")
    ))
    conn.commit()
    conn.close()
    return JSONResponse({"status": "success", "id": inv_id, "database": "SQLite"})

@app.delete("/api/crm/invoices/{inv_id}")
def delete_crm_invoice(inv_id: str):
    """Delete a CRM invoice from SQLite database."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM crm_invoices WHERE id = ?", (inv_id,))
    conn.commit()
    conn.close()
    return JSONResponse({"status": "deleted", "id": inv_id})

# -------------------------------------------------------------
# TRAVEL DESTINATIONS & PACKAGES API
# -------------------------------------------------------------

@app.get("/api/travel/destinations")
def get_travel_destinations():
    """Fetch public travel destination packages from SQLite database."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM travel_destinations WHERE active = 1 ORDER BY updated_at DESC")
    rows = cur.fetchall()
    conn.close()

    result = []
    for r in rows:
        d = dict(r)
        d["itinerary"] = json.loads(d.get("itinerary_json") or "[]")
        d["inclusions"] = json.loads(d.get("inclusions_json") or "[]")
        result.append(d)
    return JSONResponse(result)

@app.post("/api/travel/destinations")
async def save_travel_destination(request: Request):
    """Save or update a travel package in SQLite database."""
    data = await request.json()
    dest_id = data.get("id")
    if not dest_id:
        raise HTTPException(status_code=400, detail="Destination ID required")

    itinerary_json = json.dumps(data.get("itinerary") or [])
    inclusions_json = json.dumps(data.get("inclusions") or [])

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO travel_destinations (
        id, name, tag, duration, price, image, overview, itinerary_json, inclusions_json, active, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        tag = excluded.tag,
        duration = excluded.duration,
        price = excluded.price,
        image = excluded.image,
        overview = excluded.overview,
        itinerary_json = excluded.itinerary_json,
        inclusions_json = excluded.inclusions_json,
        active = 1,
        updated_at = CURRENT_TIMESTAMP;
    """, (
        dest_id,
        data.get("name", ""),
        data.get("tag", ""),
        data.get("duration", ""),
        data.get("price", ""),
        data.get("image", ""),
        data.get("overview", ""),
        itinerary_json,
        inclusions_json
    ))
    conn.commit()
    conn.close()
    return JSONResponse({"status": "success", "id": dest_id, "database": "SQLite"})
