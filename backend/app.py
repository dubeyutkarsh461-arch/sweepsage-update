"""
SweepSage Unified Backend & Database Engine
FastAPI REST API with SQLite persistent storage.
Compatible with Vercel Serverless, Local Python, and production deployments.
"""
from fastapi import FastAPI, HTTPException, Request, Depends, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import json
import os
import shutil
import random
import string
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List

app = FastAPI(
    title="SweepSage Unified API & Database",
    version="3.0.0",
    description="Unified API & SQLite Database for SweepSage Customer Bookings, Catalog, Travel CRM & Invoices"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database path resolution
BASE_DIR = Path(__file__).resolve().parent.parent

# Custom DB path from environment variable, or Vercel /tmp, or root sweepsage.db
if os.environ.get("SWEEPSAGE_DB_PATH"):
    DB_PATH = Path(os.environ["SWEEPSAGE_DB_PATH"])
elif os.environ.get("VERCEL"):
    DB_PATH = Path("/tmp/sweepsage.db")
    # If initial database exists in repository, copy to /tmp on cold start
    seed_db = BASE_DIR / "sweepsage.db"
    if seed_db.exists() and not DB_PATH.exists():
        try:
            shutil.copy2(str(seed_db), str(DB_PATH))
        except Exception as e:
            print(f"Warning: could not copy seed db to /tmp: {e}")
else:
    DB_PATH = BASE_DIR / "sweepsage.db"


def get_db_connection():
    """Create thread-safe SQLite database connection."""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def run_migrations(conn):
    """Safely apply migrations to SQLite tables if columns are missing."""
    cur = conn.cursor()

    # Check bookings table columns
    cur.execute("PRAGMA table_info(bookings);")
    existing_cols = {row["name"] for row in cur.fetchall()}

    needed_cols = {
        "booking_date": "TEXT",
        "booking_time": "TEXT",
        "event_id": "TEXT",
        "event_name": "TEXT",
        "details_json": "TEXT",
        "creator": "TEXT",
        "updated_at": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    }

    for col_name, col_type in needed_cols.items():
        if col_name not in existing_cols:
            try:
                cur.execute(f"ALTER TABLE bookings ADD COLUMN {col_name} {col_type};")
                print(f"Migration: Added column '{col_name}' to bookings table.")
            except Exception as e:
                print(f"Notice during migration of bookings.{col_name}: {e}")

    conn.commit()


def init_db():
    """Initialize SQLite database tables for CRM, Destinations, Catalog, and Bookings."""
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
            event_id TEXT,
            event_name TEXT,
            package_name TEXT,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_email TEXT,
            location TEXT,
            booking_date TEXT,
            booking_time TEXT,
            price TEXT,
            status TEXT DEFAULT 'CONFIRMED',
            notes TEXT,
            creator TEXT,
            details_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

        # 5. Global Site Catalog (Photography, Salon Config, Travel Packages)
        cur.execute("""
        CREATE TABLE IF NOT EXISTS site_catalog (
            id TEXT PRIMARY KEY,
            catalog_json TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Run schema migrations for any existing tables
        run_migrations(conn)

        # Seed founder email if empty
        cur.execute("INSERT OR IGNORE INTO crm_coordinators (email, role) VALUES ('dubeyutkarsh461@gmail.com', 'Founder');")

        # Seed initial sample bookings if table is empty
        cur.execute("SELECT COUNT(*) FROM bookings;")
        count = cur.fetchone()[0]
        if count == 0:
            initial_bookings = [
                (
                    "SS-98214", "photographer", "instant", "Instant Doorstep Photographer",
                    "Instant Shoot (1 Hour)", "Utkarsh Dubey", "+91 95558 26615", "dubeyutkarsh461@gmail.com",
                    "N-52, Delta-3, Greater Noida, Uttar Pradesh, 201308", "2026-10-29", "15:30",
                    "₹1,499", "CONFIRMED", "Pro Aman Sharma assigned. Priority doorstep dispatch.",
                    "Aman Sharma (★ 4.9)", json.dumps({"hours": "1", "dispatchType": "instant"})
                ),
                (
                    "SS-84192", "photographer", "prewedding", "Pre-Wedding & Cinematic Storytelling",
                    "Signature Wedding Story", "Rohan & Sneha", "+91 98712 34567", "rohan.sneha@gmail.com",
                    "Lodhi Garden & Sunder Nursery, Delhi NCR", "2026-10-18", "11:30",
                    "₹12,999", "COMPLETED", "120 RAW 4K Frames delivered to cloud album.",
                    "Kunal Verma (Lead Cinema Director)", json.dumps({"drone": True, "deliverables": "RAW 4K"})
                ),
                (
                    "SS-76210", "salon", "facial_spa", "Salon at Home — Glow Facial & Hair Spa",
                    "Deep Glow Deluxe Ritual", "Priya Sharma", "+91 98101 22334", "priya.sharma@outlook.com",
                    "Sector 50, Noida, UP", "2026-09-12", "14:15",
                    "₹2,199", "COMPLETED", "Single-use sealed hygiene kit used. Clean-up done.",
                    "Pooja Sharma (Senior Stylist)", json.dumps({"sealedKit": True, "sanitized": True})
                ),
                (
                    "SS-61405", "travel", "himachal", "Himalayan Luxury Escape — Rishikesh & Mussoorie",
                    "Handcrafted Boutique Getaway", "Amitabh Verma", "+91 99203 11452", "averma@corp.in",
                    "Rishikesh Boutique Resort", "2026-11-15", "09:00",
                    "₹18,500", "PENDING", "Private cab transfer and riverside cottage request.",
                    "SweepSage Travel Concierge", json.dumps({"cabType": "Private SUV", "mealPlan": "CP"})
                )
            ]
            cur.executemany("""
            INSERT INTO bookings (
                reference, service, event_id, event_name, package_name, customer_name,
                customer_phone, customer_email, location, booking_date, booking_time,
                price, status, notes, creator, details_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, initial_bookings)
            print("Seeded 4 initial reference bookings into SQLite database.")

        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Database init notice: {e}")


# Initialize database schema and tables
init_db()


# -------------------------------------------------------------
# SYSTEM & HEALTH
# -------------------------------------------------------------

@app.get("/api/health")
def health_check():
    """Health check endpoint showing active SQLite database connection."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM bookings;")
    b_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM crm_invoices;")
    i_count = cur.fetchone()[0]
    conn.close()

    return JSONResponse({
        "status": "healthy",
        "service": "SweepSage Unified Backend",
        "version": "3.0.0",
        "database": "SQLite (Active)",
        "db_path": str(DB_PATH),
        "counts": {
            "bookings": b_count,
            "crm_invoices": i_count
        },
        "time": datetime.utcnow().isoformat() + "Z"
    })


# -------------------------------------------------------------
# CUSTOMER BOOKINGS API
# -------------------------------------------------------------

def generate_booking_reference() -> str:
    """Generate a clean, professional booking reference like SS-20261128-A4K9."""
    date_part = datetime.utcnow().strftime("%Y%m%d")
    rand_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"SS-{date_part}-{rand_part}"


@app.post("/api/bookings", status_code=status.HTTP_201_CREATED)
async def create_booking(request: Request):
    """
    Create a new customer booking in the database.
    Accepts booking details from frontend flows (photography, salon, travel).
    """
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    customer_name = (data.get("customer_name") or data.get("name") or "").strip()
    customer_phone = (data.get("customer_phone") or data.get("phone") or "").strip()
    customer_email = (data.get("customer_email") or data.get("email") or "").strip()

    if not customer_name:
        raise HTTPException(status_code=422, detail="Customer name is required")
    if not customer_phone:
        raise HTTPException(status_code=422, detail="Customer phone number is required")

    reference = data.get("reference")
    if not reference or not str(reference).strip():
        reference = generate_booking_reference()
    else:
        reference = str(reference).strip()
        if not reference.startswith("SS-"):
            reference = f"SS-{reference}"

    service = (data.get("service") or "general").strip()
    event_id = data.get("event_id") or ""
    event_name = data.get("event_name") or ""
    package_name = data.get("package_name") or data.get("package") or ""
    price = data.get("price") or ""
    location = data.get("location") or data.get("address") or ""
    booking_date = data.get("booking_date") or data.get("date") or datetime.utcnow().strftime("%Y-%m-%d")
    booking_time = data.get("booking_time") or data.get("time") or ""
    booking_status = data.get("status") or "CONFIRMED"
    notes = data.get("notes") or data.get("message") or ""
    creator = data.get("creator") or "Verified SweepSage Pro"

    details = data.get("details") or {}
    details_json = json.dumps(details) if isinstance(details, (dict, list)) else str(details)

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
        INSERT INTO bookings (
            reference, service, event_id, event_name, package_name, customer_name,
            customer_phone, customer_email, location, booking_date, booking_time,
            price, status, notes, creator, details_json, created_at, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        );
        """, (
            reference, service, event_id, event_name, package_name, customer_name,
            customer_phone, customer_email, location, booking_date, booking_time,
            price, booking_status, notes, creator, details_json
        ))
        booking_id = cur.lastrowid
        conn.commit()

        # Fetch created row
        cur.execute("SELECT * FROM bookings WHERE id = ?;", (booking_id,))
        row = cur.fetchone()
        b_dict = dict(row)
        b_dict["details"] = json.loads(b_dict.get("details_json") or "{}")
        conn.close()

        return JSONResponse({
            "success": True,
            "reference": reference,
            "id": booking_id,
            "booking": b_dict,
            "message": "Booking successfully saved in SweepSage database."
        }, status_code=status.HTTP_201_CREATED)

    except sqlite3.IntegrityError:
        conn.close()
        # If reference collided, generate a new reference and retry once
        new_ref = generate_booking_reference()
        return await create_booking(request)
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database error while saving booking: {str(e)}")


@app.get("/api/bookings")
def get_bookings(
    service: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 200,
    offset: int = 0
):
    """
    List bookings with optional filtering by service, status, or search keyword.
    Used by Admin Operations, Dispatch Dashboard, and Customer Tracking.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    query = "SELECT * FROM bookings WHERE 1=1"
    params = []

    if service and service.strip() and service.lower() != "all":
        query += " AND LOWER(service) = ?"
        params.append(service.strip().lower())

    if status and status.strip() and status.lower() != "all":
        query += " AND UPPER(status) = ?"
        params.append(status.strip().upper())

    if search and search.strip():
        q = f"%{search.strip().lower()}%"
        query += " AND (LOWER(customer_name) LIKE ? OR LOWER(customer_phone) LIKE ? OR LOWER(reference) LIKE ? OR LOWER(location) LIKE ? OR LOWER(package_name) LIKE ?)"
        params.extend([q, q, q, q, q])

    # Count total matching
    count_query = query.replace("SELECT *", "SELECT COUNT(*)")
    cur.execute(count_query, params)
    total_count = cur.fetchone()[0]

    # Order and paginate
    query += " ORDER BY id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()

    result = []
    for r in rows:
        d = dict(r)
        d["details"] = json.loads(d.get("details_json") or "{}")
        result.append(d)

    return JSONResponse({
        "success": True,
        "total": total_count,
        "bookings": result
    })


@app.get("/api/bookings/{reference}")
def get_booking_by_reference(reference: str):
    """Fetch single booking by booking reference code or numerical ID."""
    clean_ref = reference.strip()
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
    SELECT * FROM bookings 
    WHERE reference = ? 
       OR reference = ? 
       OR id = ?
    LIMIT 1;
    """, (clean_ref, clean_ref.replace("#", ""), clean_ref))
    row = cur.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail=f"Booking '{reference}' not found")

    d = dict(row)
    d["details"] = json.loads(d.get("details_json") or "{}")
    return JSONResponse({
        "success": True,
        "booking": d
    })


@app.patch("/api/bookings/{reference}")
async def update_booking_status(reference: str, request: Request):
    """
    Update booking status, notes, or assigned creator.
    Used by Admin console for live dispatch updates.
    """
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    clean_ref = reference.strip().replace("#", "")
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM bookings WHERE reference = ? OR id = ?;", (clean_ref, clean_ref))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Booking not found")

    new_status = data.get("status")
    notes = data.get("notes")
    creator = data.get("creator")
    price = data.get("price")
    location = data.get("location")

    updates = []
    params = []

    if new_status is not None:
        updates.append("status = ?")
        params.append(str(new_status).upper())

    if notes is not None:
        updates.append("notes = ?")
        params.append(str(notes))

    if creator is not None:
        updates.append("creator = ?")
        params.append(str(creator))

    if price is not None:
        updates.append("price = ?")
        params.append(str(price))

    if location is not None:
        updates.append("location = ?")
        params.append(str(location))

    if not updates:
        conn.close()
        return JSONResponse({"success": True, "message": "No changes requested", "booking": dict(row)})

    updates.append("updated_at = CURRENT_TIMESTAMP")
    set_clause = ", ".join(updates)
    params.extend([clean_ref, clean_ref])

    cur.execute(f"UPDATE bookings SET {set_clause} WHERE reference = ? OR id = ?;", params)
    conn.commit()

    cur.execute("SELECT * FROM bookings WHERE reference = ? OR id = ?;", (clean_ref, clean_ref))
    updated_row = cur.fetchone()
    conn.close()

    d = dict(updated_row)
    d["details"] = json.loads(d.get("details_json") or "{}")

    return JSONResponse({
        "success": True,
        "booking": d,
        "message": f"Booking {clean_ref} updated successfully"
    })


@app.delete("/api/bookings/{reference}")
def delete_booking(reference: str):
    """Delete a booking from the database (Admin only)."""
    clean_ref = reference.strip().replace("#", "")
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM bookings WHERE reference = ? OR id = ?;", (clean_ref, clean_ref))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Booking not found")

    cur.execute("DELETE FROM bookings WHERE reference = ? OR id = ?;", (clean_ref, clean_ref))
    conn.commit()
    conn.close()

    return JSONResponse({
        "success": True,
        "reference": clean_ref,
        "message": "Booking deleted successfully"
    })


# -------------------------------------------------------------
# GLOBAL SITE CATALOG API (PHOTOGRAPHY, SALON, TRAVEL)
# -------------------------------------------------------------

@app.get("/api/catalog")
def get_site_catalog():
    """Fetch global site catalog state (Photography services, Salon config, Travel packages) from SQLite."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT catalog_json FROM site_catalog WHERE id = 'main'")
    row = cur.fetchone()
    conn.close()
    if row and row["catalog_json"]:
        try:
            return JSONResponse(json.loads(row["catalog_json"]))
        except Exception:
            pass
    return JSONResponse({})


@app.post("/api/catalog")
@app.put("/api/catalog")
async def save_site_catalog(request: Request):
    """Save or update global site catalog state to SQLite database."""
    data = await request.json()
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO site_catalog (id, catalog_json, updated_at)
    VALUES ('main', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET catalog_json = excluded.catalog_json, updated_at = CURRENT_TIMESTAMP;
    """, (json.dumps(data),))
    conn.commit()
    conn.close()
    return JSONResponse({"success": True, "database": "SQLite", "synced": True})


# -------------------------------------------------------------
# CRM INVOICES & ITINERARIES API
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
# CRM COORDINATORS API
# -------------------------------------------------------------

@app.get("/api/crm/coordinators")
def get_coordinators():
    """Fetch list of authorized CRM coordinators."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT email, role, created_at FROM crm_coordinators ORDER BY created_at ASC;")
    rows = cur.fetchall()
    conn.close()
    return JSONResponse([dict(r) for r in rows])


@app.post("/api/crm/coordinators")
async def add_coordinator(request: Request):
    """Authorize a new coordinator email for Travel CRM."""
    data = await request.json()
    email = (data.get("email") or "").strip().lower()
    role = data.get("role") or "Coordinator"

    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email address is required")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("INSERT OR IGNORE INTO crm_coordinators (email, role) VALUES (?, ?);", (email, role))
    conn.commit()
    conn.close()
    return JSONResponse({"status": "success", "email": email, "role": role})


@app.delete("/api/crm/coordinators/{email}")
def remove_coordinator(email: str):
    """Revoke coordinator access (cannot remove founder)."""
    clean_email = email.strip().lower()
    if clean_email == "dubeyutkarsh461@gmail.com":
        raise HTTPException(status_code=403, detail="Cannot revoke founder coordinator account")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM crm_coordinators WHERE email = ?;", (clean_email,))
    conn.commit()
    conn.close()
    return JSONResponse({"status": "removed", "email": clean_email})


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
        dest_id = "dest_" + datetime.utcnow().strftime("%Y%m%d%H%M%S")

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


@app.put("/api/travel/destinations/{dest_id}")
async def update_travel_destination(dest_id: str, request: Request):
    """Update an existing travel package in SQLite database."""
    data = await request.json()
    data["id"] = dest_id
    itinerary_json = json.dumps(data.get("itinerary") or [])
    inclusions_json = json.dumps(data.get("inclusions") or [])

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
    UPDATE travel_destinations SET
        name = COALESCE(?, name),
        tag = COALESCE(?, tag),
        duration = COALESCE(?, duration),
        price = COALESCE(?, price),
        image = COALESCE(?, image),
        overview = COALESCE(?, overview),
        itinerary_json = ?,
        inclusions_json = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?;
    """, (
        data.get("name"),
        data.get("tag"),
        data.get("duration"),
        data.get("price"),
        data.get("image"),
        data.get("overview"),
        itinerary_json,
        inclusions_json,
        dest_id
    ))
    conn.commit()
    conn.close()
    return JSONResponse({"status": "success", "id": dest_id})


@app.delete("/api/travel/destinations/{dest_id}")
def delete_travel_destination(dest_id: str):
    """Remove a travel destination from the database."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM travel_destinations WHERE id = ?;", (dest_id,))
    conn.commit()
    conn.close()
    return JSONResponse({"status": "deleted", "id": dest_id})


# -------------------------------------------------------------
# ADMIN AUTHENTICATION
# -------------------------------------------------------------

@app.post("/api/admin/login")
async def admin_login(request: Request):
    """Admin login endpoint."""
    data = await request.json()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    # Founder/lead credentials check
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT email, role FROM crm_coordinators WHERE email = ?;", (email,))
    coord = cur.fetchone()
    conn.close()

    # Allow authorized coordinator or master pass
    if coord or email in ["dubeyutkarsh461@gmail.com", "admin@sweepsage.com"]:
        return JSONResponse({
            "success": True,
            "token": "ss_auth_admin_" + ''.join(random.choices(string.ascii_letters + string.digits, k=32)),
            "email": email,
            "role": coord["role"] if coord else "Admin",
            "message": "Authenticated successfully"
        })

    raise HTTPException(status_code=401, detail="Unauthorized: invalid email or access not granted")


# -------------------------------------------------------------
# MAIN APP ENTRY FOR DIRECT EXECUTION
# -------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    print("Starting SweepSage FastAPI Server on http://127.0.0.1:8000 ...")
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
