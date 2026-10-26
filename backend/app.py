import os
import re
import json
import secrets
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Header, Depends, Query, Request, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from pydantic import BaseModel, Field

from .database import get_db_connection, init_db
from .seed import seed_database
from .auth import hash_password, verify_password, generate_session_token, get_session_expiry

# Setup directories
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

# Create FastAPI app
app = FastAPI(
    title="SweepSage Backend API",
    description="REST API for SweepSage luxury booking platform: Bookings, Partner Portal, and Admin Management",
    version="1.0.0"
)

# Enable CORS for all origins so static files and API work both hosted together or separately
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# PYDANTIC SCHEMAS
# =========================================================

class BookingCreate(BaseModel):
    service: str = Field(..., description="photographer, salon, travel, or general")
    event_id: Optional[str] = None
    event_name: Optional[str] = None
    package_name: Optional[str] = None
    price: Optional[str] = None
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    location: Optional[str] = None
    booking_date: Optional[str] = None
    booking_time: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class BookingStatusUpdate(BaseModel):
    status: str = Field(..., description="PENDING, CONFIRMED, COMPLETED, CANCELLED")
    notes: Optional[str] = None

class PartnerRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = ""
    profession: str
    location: str
    bio: Optional[str] = ""
    profile_image: Optional[str] = ""
    instagram: Optional[str] = ""
    website: Optional[str] = ""

class PartnerLogin(BaseModel):
    email: str
    password: str

class PartnerProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    profession: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    instagram: Optional[str] = None
    website: Optional[str] = None
    behance: Optional[str] = None
    facebook: Optional[str] = None
    youtube: Optional[str] = None

class PortfolioItemCreate(BaseModel):
    title: str
    type: str = Field(default="Photos", description="Photos, Videos, Reels, Events")
    media_type: str = Field(default="image", description="image or video")
    src: str
    poster: Optional[str] = ""

class PartnerStatusUpdate(BaseModel):
    status: str = Field(..., description="APPROVED, PENDING, REJECTED")

class PortfolioStatusUpdate(BaseModel):
    status: str = Field(..., description="APPROVED, PENDING, REJECTED")

# =========================================================
# AUTH DEPENDENCY
# =========================================================

def get_current_partner(
    authorization: Optional[str] = Header(None),
    x_partner_token: Optional[str] = Header(None)
) -> Dict[str, Any]:
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
    elif x_partner_token:
        token = x_partner_token.strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required"
        )

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT s.token, s.expires_at, p.*
        FROM partner_sessions s
        JOIN partners p ON s.partner_id = p.id
        WHERE s.token = ?
    """, (token,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token"
        )

    # Check expiry
    try:
        expires_at = datetime.fromisoformat(row["expires_at"])
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session token has expired"
            )
    except Exception:
        pass

    partner = dict(row)
    partner.pop("password_hash", None)
    return partner

# =========================================================
# STARTUP EVENT
# =========================================================

@app.on_event("startup")
def on_startup():
    init_db()
    seed_database()

# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "online",
        "service": "SweepSage API",
        "time": datetime.now(timezone.utc).isoformat(),
        "database": "SQLite (sweepsage.db)"
    }

# =========================================================
# BOOKINGS API
# =========================================================

def generate_booking_ref() -> str:
    today_str = datetime.now().strftime("%Y%m%d")
    rand_chars = "".join(secrets.choice("ABCDEFGHJKLMNPQRSTUVWXYZ23456789") for _ in range(4))
    return f"SS-{today_str}-{rand_chars}"

@app.post("/api/bookings", status_code=status.HTTP_201_CREATED, tags=["Bookings"])
def create_booking(payload: BookingCreate):
    conn = get_db_connection()
    cursor = conn.cursor()

    reference = generate_booking_ref()
    details_str = json.dumps(payload.details or {}, ensure_ascii=False)

    cursor.execute("""
        INSERT INTO bookings (
            reference, service, event_id, event_name, package_name, price,
            customer_name, customer_phone, customer_email, location,
            booking_date, booking_time, details_json, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
    """, (
        reference,
        payload.service.lower(),
        payload.event_id,
        payload.event_name,
        payload.package_name,
        payload.price,
        payload.customer_name,
        payload.customer_phone,
        payload.customer_email,
        payload.location,
        payload.booking_date,
        payload.booking_time,
        details_str,
        payload.notes
    ))
    booking_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM bookings WHERE id = ?", (booking_id,))
    booking = dict(cursor.fetchone())
    conn.close()

    try:
        booking["details"] = json.loads(booking.get("details_json") or "{}")
    except Exception:
        booking["details"] = {}

    return {
        "success": True,
        "message": "Booking received successfully",
        "reference": reference,
        "booking": booking
    }

@app.get("/api/bookings", tags=["Bookings"])
def list_bookings(
    service: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM bookings WHERE 1=1"
    params = []

    if service:
        query += " AND service = ?"
        params.append(service.lower())
    if status:
        query += " AND status = ?"
        params.append(status.upper())
    if search:
        query += " AND (customer_name LIKE ? OR customer_phone LIKE ? OR reference LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s])

    query += " ORDER BY id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()

    bookings = []
    for r in rows:
        item = dict(r)
        try:
            item["details"] = json.loads(item.get("details_json") or "{}")
        except Exception:
            item["details"] = {}
        bookings.append(item)

    # Count total
    count_query = "SELECT COUNT(*) as total FROM bookings"
    cursor.execute(count_query)
    total = cursor.fetchone()["total"]

    conn.close()
    return {
        "total": total,
        "count": len(bookings),
        "bookings": bookings
    }

@app.get("/api/bookings/{ref_or_id}", tags=["Bookings"])
def get_booking(ref_or_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    if ref_or_id.isdigit():
        cursor.execute("SELECT * FROM bookings WHERE id = ?", (int(ref_or_id),))
    else:
        cursor.execute("SELECT * FROM bookings WHERE reference = ?", (ref_or_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Booking not found")

    item = dict(row)
    try:
        item["details"] = json.loads(item.get("details_json") or "{}")
    except Exception:
        item["details"] = {}
    return item

@app.patch("/api/bookings/{booking_id}/status", tags=["Bookings"])
def update_booking_status(booking_id: int, payload: BookingStatusUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM bookings WHERE id = ?", (booking_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Booking not found")

    cursor.execute("""
        UPDATE bookings
        SET status = ?, notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (payload.status.upper(), payload.notes, booking_id))
    conn.commit()

    cursor.execute("SELECT * FROM bookings WHERE id = ?", (booking_id,))
    updated = dict(cursor.fetchone())
    conn.close()
    return {"success": True, "booking": updated}

@app.delete("/api/bookings/{booking_id}", tags=["Bookings"])
def delete_booking(booking_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM bookings WHERE id = ?", (booking_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    if not deleted:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"success": True, "message": "Booking removed"}

# =========================================================
# PARTNER AUTHENTICATION & PORTAL API
# =========================================================

def slugify(text: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"[-\s]+", "-", slug)

def render_approval_result_html(success: bool, title: str, message: str, partner_slug: Optional[str] = None, partner_name: Optional[str] = None) -> str:
    status_color = "#10b981" if success else "#ef4444"
    status_badge = "APPROVED &amp; ACTIVE" if success else "NOTICE"
    icon = "&#10003;" if success else "&#10005;"
    view_profile_btn = f'<a href="/partner-profile.html?slug={partner_slug}" class="btn" style="background:#fc5e68;color:#fff;border:none;">View Live Profile &#8599;</a>' if (success and partner_slug) else ""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} | SweepSage Admin</title>
  <link rel="icon" type="image/png" href="/logo.png">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Manrope:wght@600;800&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: radial-gradient(circle at top, #1c1517 0%, #090a0c 60%, #000 100%);
      color: #e5e7eb;
      font-family: 'DM Sans', -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }}
    .card {{
      background: rgba(24, 26, 31, 0.95);
      border: 1px solid rgba(252, 94, 104, 0.25);
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(252, 94, 104, 0.12);
      border-radius: 24px;
      max-width: 520px;
      width: 100%;
      padding: 44px 32px;
      text-align: center;
      backdrop-filter: blur(16px);
      position: relative;
      overflow: hidden;
    }}
    .card::before {{
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(90deg, #fc5e68, #ff858e, #10b981);
    }}
    .icon-badge {{
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: {status_color}18;
      border: 2px solid {status_color};
      color: {status_color};
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 34px;
      font-weight: 800;
      margin: 0 auto 20px;
      box-shadow: 0 0 25px {status_color}33;
    }}
    h1 {{
      font-family: 'Manrope', sans-serif;
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }}
    .status-tag {{
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 5px 14px;
      border-radius: 999px;
      background: {status_color}22;
      color: {status_color};
      border: 1px solid {status_color}44;
      margin-bottom: 20px;
    }}
    p {{
      color: #9ca3af;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 28px;
    }}
    p strong {{ color: #ffffff; }}
    .actions {{
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }}
    .btn {{
      padding: 13px 22px;
      border-radius: 12px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      text-align: center;
      transition: all 0.2s ease;
      display: block;
    }}
    .btn-secondary {{
      background: rgba(255, 255, 255, 0.06);
      color: #e5e7eb;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }}
    .btn-secondary:hover {{
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }}
    .footer-note {{
      margin-top: 28px;
      font-size: 12px;
      color: #6b7280;
    }}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-badge">{icon}</div>
    <div class="status-tag">{status_badge}</div>
    <h1>{title}</h1>
    <p>{message}</p>
    <div class="actions">
      {view_profile_btn}
      <a href="/admin.html" class="btn btn-secondary">Open SweepSage Admin Console &#8594;</a>
      <a href="/" class="btn btn-secondary" style="border:none;background:transparent;color:#9ca3af;font-size:13px;">&#8592; Return to SweepSage Home</a>
    </div>
    <div class="footer-note">SweepSage Instant Partner Verification System</div>
  </div>
</body>
</html>"""

@app.post("/api/partners/register", status_code=status.HTTP_201_CREATED, tags=["Partners"])
def register_partner(payload: PartnerRegister, request: Request):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check email uniqueness
    cursor.execute("SELECT id FROM partners WHERE LOWER(email) = LOWER(?)", (payload.email.strip(),))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="An account with this email already exists. Please log in.")

    base_slug = slugify(payload.name)
    slug = base_slug
    idx = 1
    while True:
        cursor.execute("SELECT id FROM partners WHERE slug = ?", (slug,))
        if not cursor.fetchone():
            break
        idx += 1
        slug = f"{base_slug}-{idx}"

    pwd_hash = hash_password(payload.password)
    default_img = payload.profile_image or "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80"
    approval_token = secrets.token_urlsafe(32)

    cursor.execute("""
        INSERT INTO partners (
            slug, name, email, phone, password_hash, profession, location,
            bio, rating, profile_image, status, instagram, website, approval_token
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 5.0, ?, 'PENDING', ?, ?, ?)
    """, (
        slug,
        payload.name.strip(),
        payload.email.strip().lower(),
        payload.phone.strip(),
        pwd_hash,
        payload.profession.strip(),
        payload.location.strip(),
        payload.bio.strip(),
        default_img,
        payload.instagram.strip(),
        payload.website.strip(),
        approval_token
    ))
    partner_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM partners WHERE id = ?", (partner_id,))
    partner = dict(cursor.fetchone())
    partner.pop("password_hash", None)
    conn.close()

    base_url = str(request.base_url).rstrip("/")
    approval_url = f"{base_url}/api/admin/partners/approve?token={approval_token}"
    reject_url = f"{base_url}/api/admin/partners/reject?token={approval_token}"

    return {
        "success": True,
        "message": "Registration submitted successfully. Approval request ready for WhatsApp verification.",
        "partner": partner,
        "approval_token": approval_token,
        "approval_url": approval_url,
        "reject_url": reject_url
    }

@app.post("/api/partners/login", tags=["Partners"])
def login_partner(payload: PartnerLogin):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM partners WHERE LOWER(email) = LOWER(?)", (payload.email.strip(),))
    row = cursor.fetchone()

    if not row or not verify_password(row["password_hash"], payload.password):
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    partner = dict(row)
    partner.pop("password_hash", None)

    token = generate_session_token()
    expires_at = get_session_expiry(days=30)

    cursor.execute("""
        INSERT INTO partner_sessions (token, partner_id, expires_at)
        VALUES (?, ?, ?)
    """, (token, partner["id"], expires_at))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": "Login successful",
        "token": token,
        "partner": partner
    }

@app.post("/api/partners/logout", tags=["Partners"])
def logout_partner(token: Optional[str] = Header(None, alias="X-Partner-Token")):
    if token:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM partner_sessions WHERE token = ?", (token,))
        conn.commit()
        conn.close()
    return {"success": True, "message": "Logged out successfully"}

@app.get("/api/partners/me", tags=["Partners"])
def get_current_partner_profile(partner: Dict[str, Any] = Depends(get_current_partner)):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM portfolio_items
        WHERE partner_id = ?
        ORDER BY id DESC
    """, (partner["id"],))
    portfolio = [dict(r) for r in cursor.fetchall()]
    conn.close()

    partner["portfolio"] = portfolio
    partner["portfolio_count"] = len(portfolio)
    partner["portfolioCount"] = len(portfolio)
    partner["profileImage"] = partner.get("profile_image") or "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80"
    return partner

@app.put("/api/partners/me", tags=["Partners"])
def update_current_partner_profile(
    payload: PartnerProfileUpdate,
    partner: Dict[str, Any] = Depends(get_current_partner)
):
    conn = get_db_connection()
    cursor = conn.cursor()

    fields = []
    params = []

    for key, val in payload.dict(exclude_unset=True).items():
        if val is not None:
            fields.append(f"{key} = ?")
            params.append(val)

    if fields:
        fields.append("updated_at = CURRENT_TIMESTAMP")
        params.append(partner["id"])
        query = f"UPDATE partners SET {', '.join(fields)} WHERE id = ?"
        cursor.execute(query, params)
        conn.commit()

    cursor.execute("SELECT * FROM partners WHERE id = ?", (partner["id"],))
    updated = dict(cursor.fetchone())
    updated.pop("password_hash", None)
    updated["profileImage"] = updated.get("profile_image") or "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80"
    conn.close()

    return {"success": True, "partner": updated}

@app.post("/api/partners/me/portfolio", status_code=status.HTTP_201_CREATED, tags=["Partners"])
def add_portfolio_item(
    payload: PortfolioItemCreate,
    partner: Dict[str, Any] = Depends(get_current_partner)
):
    conn = get_db_connection()
    cursor = conn.cursor()

    item_uid = f"item-{int(datetime.now().timestamp())}-{secrets.token_hex(4)}"

    cursor.execute("""
        INSERT INTO portfolio_items (
            partner_id, item_uid, title, type, media_type, src, poster, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'APPROVED')
    """, (
        partner["id"],
        item_uid,
        payload.title.strip(),
        payload.type,
        payload.media_type,
        payload.src.strip(),
        payload.poster.strip() if payload.poster else ""
    ))
    new_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM portfolio_items WHERE id = ?", (new_id,))
    item = dict(cursor.fetchone())
    conn.close()

    return {"success": True, "item": item}

@app.post("/api/partners/me/upload", status_code=status.HTTP_201_CREATED, tags=["Partners"])
async def upload_partner_media(
    file: UploadFile = File(...),
    title: str = Form(...),
    type: str = Form("Photos"),
    media_type: Optional[str] = Form(None),
    poster_file: Optional[UploadFile] = File(None),
    poster_url: Optional[str] = Form(""),
    partner: Dict[str, Any] = Depends(get_current_partner)
):
    """
    Direct file upload for authenticated partner profile.
    Strictly restricted to the partner matching the authenticated session ID.
    """
    if not title or not title.strip():
        raise HTTPException(status_code=400, detail="Title is required")

    filename = file.filename or "media"
    ext = os.path.splitext(filename)[1].lower()
    content_type = (file.content_type or "").lower()

    # Determine media type (image or video)
    if "video" in content_type or ext in [".mp4", ".mov", ".webm", ".avi", ".mkv", ".m4v"]:
        detected_media_type = "video"
        if not ext:
            ext = ".mp4"
    else:
        detected_media_type = "image"
        if not ext:
            ext = ".jpg"

    if media_type in ["image", "video"]:
        detected_media_type = media_type

    # Save to uploads/partners/{partner_id}
    partner_upload_dir = PROJECT_ROOT / "uploads" / "partners" / str(partner["id"])
    partner_upload_dir.mkdir(parents=True, exist_ok=True)

    safe_name = f"{int(datetime.now().timestamp())}_{secrets.token_hex(4)}{ext}"
    dest_path = partner_upload_dir / safe_name

    file_bytes = await file.read()
    with open(dest_path, "wb") as f:
        f.write(file_bytes)

    media_src = f"/uploads/partners/{partner['id']}/{safe_name}"

    # Handle optional poster/thumbnail
    final_poster = poster_url or ""
    if poster_file and poster_file.filename:
        p_ext = os.path.splitext(poster_file.filename)[1].lower() or ".jpg"
        p_name = f"poster_{int(datetime.now().timestamp())}_{secrets.token_hex(4)}{p_ext}"
        p_path = partner_upload_dir / p_name
        p_bytes = await poster_file.read()
        with open(p_path, "wb") as pf:
            pf.write(p_bytes)
        final_poster = f"/uploads/partners/{partner['id']}/{p_name}"

    conn = get_db_connection()
    cursor = conn.cursor()

    item_uid = f"item-{int(datetime.now().timestamp())}-{secrets.token_hex(4)}"

    cursor.execute("""
        INSERT INTO portfolio_items (
            partner_id, item_uid, title, type, media_type, src, poster, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'APPROVED')
    """, (
        partner["id"],
        item_uid,
        title.strip(),
        type,
        detected_media_type,
        media_src,
        final_poster
    ))
    new_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM portfolio_items WHERE id = ?", (new_id,))
    item = dict(cursor.fetchone())
    conn.close()

    return {"success": True, "item": item}

@app.post("/api/partners/me/avatar", tags=["Partners"])
async def upload_partner_avatar(
    file: UploadFile = File(...),
    partner: Dict[str, Any] = Depends(get_current_partner)
):
    """
    Direct avatar image upload for the authenticated partner's profile.
    """
    avatar_dir = PROJECT_ROOT / "uploads" / "avatars"
    avatar_dir.mkdir(parents=True, exist_ok=True)

    filename = file.filename or "avatar.jpg"
    ext = os.path.splitext(filename)[1].lower() or ".jpg"
    safe_name = f"avatar_{partner['id']}_{int(datetime.now().timestamp())}_{secrets.token_hex(3)}{ext}"
    dest_path = avatar_dir / safe_name

    content = await file.read()
    with open(dest_path, "wb") as f:
        f.write(content)

    avatar_url = f"/uploads/avatars/{safe_name}"

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE partners SET profile_image = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (avatar_url, partner["id"]))
    conn.commit()

    cursor.execute("SELECT * FROM partners WHERE id = ?", (partner["id"],))
    updated = dict(cursor.fetchone())
    updated.pop("password_hash", None)
    updated["profileImage"] = avatar_url
    conn.close()

    return {"success": True, "avatar_url": avatar_url, "partner": updated}

@app.delete("/api/partners/me/portfolio/{item_id}", tags=["Partners"])
def delete_portfolio_item(
    item_id: int,
    partner: Dict[str, Any] = Depends(get_current_partner)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        DELETE FROM portfolio_items
        WHERE id = ? AND partner_id = ?
    """, (item_id, partner["id"]))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()

    if not deleted:
        raise HTTPException(status_code=404, detail="Portfolio item not found or you are not authorized to delete it.")
    return {"success": True, "message": "Portfolio item removed"}

# =========================================================
# PUBLIC PARTNERS DIRECTORY
# =========================================================

@app.get("/api/partners", tags=["Public Directory"])
def list_public_partners(
    group: Optional[str] = None,
    category: Optional[str] = None,
    status_filter: Optional[str] = "APPROVED"
):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM partners WHERE 1=1"
    params = []

    if status_filter:
        query += " AND status = ?"
        params.append(status_filter.upper())

    if category and category != "All":
        query += " AND profession LIKE ?"
        params.append(f"%{category}%")

    query += " ORDER BY rating DESC, id ASC"
    cursor.execute(query, params)
    rows = cursor.fetchall()

    partners = []
    for r in rows:
        p = dict(r)
        p.pop("password_hash", None)

        # Get portfolio items
        cursor.execute("""
            SELECT * FROM portfolio_items
            WHERE partner_id = ? AND status = 'APPROVED'
            ORDER BY id ASC
        """, (p["id"],))
        portfolio = [dict(item) for item in cursor.fetchall()]
        p["portfolio"] = portfolio
        p["portfolioCount"] = len(portfolio)
        p["profileImage"] = p.get("profile_image") or "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80"
        p["social"] = {
            "instagram": p.get("instagram"),
            "website": p.get("website"),
            "behance": p.get("behance"),
            "facebook": p.get("facebook"),
            "youtube": p.get("youtube")
        }
        partners.append(p)

    conn.close()

    # Filter by group if requested
    if group == "photography":
        partners = [p for p in partners if p.get("profession") in ["Photographer", "Videographer", "Cinematographer"]]
    elif group == "salon":
        partners = [p for p in partners if p.get("profession") in [
            "Makeup Artist", "Mehndi Artist", "Hairstylist", "Salon Specialist", "Skin Therapist", "Fashion Stylist", "Decorator"
        ]]
    elif group == "travel":
        partners = [p for p in partners if p.get("profession") in ["Travel Guide", "Tour Guide", "Trip Curator"]]

    return partners

@app.get("/api/partners/{slug_or_id}", tags=["Public Directory"])
def get_public_partner(
    slug_or_id: str,
    authorization: Optional[str] = Header(None),
    x_partner_token: Optional[str] = Header(None)
):
    conn = get_db_connection()
    cursor = conn.cursor()

    if slug_or_id.isdigit():
        cursor.execute("SELECT * FROM partners WHERE id = ?", (int(slug_or_id),))
    else:
        cursor.execute("SELECT * FROM partners WHERE slug = ?", (slug_or_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Partner not found")

    partner = dict(row)
    partner.pop("password_hash", None)

    # Check ownership
    is_owner = False
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
    elif x_partner_token:
        token = x_partner_token.strip()

    if token:
        cursor.execute("SELECT partner_id FROM partner_sessions WHERE token = ?", (token,))
        sess = cursor.fetchone()
        if sess and sess["partner_id"] == partner["id"]:
            is_owner = True

    # Check if profile is approved or accessed by owner
    if partner.get("status") != "APPROVED" and not is_owner:
        conn.close()
        raise HTTPException(
            status_code=403,
            detail="This partner profile is pending verification and admin approval."
        )

    # If owner, show all items (including pending); if public visitor, show APPROVED
    if is_owner:
        cursor.execute("""
            SELECT * FROM portfolio_items
            WHERE partner_id = ?
            ORDER BY id DESC
        """, (partner["id"],))
    else:
        cursor.execute("""
            SELECT * FROM portfolio_items
            WHERE partner_id = ? AND status = 'APPROVED'
            ORDER BY id DESC
        """, (partner["id"],))

    portfolio = [dict(item) for item in cursor.fetchall()]
    conn.close()

    partner["is_owner"] = is_owner
    partner["portfolio"] = portfolio
    partner["portfolioCount"] = len(portfolio)
    partner["profileImage"] = partner.get("profile_image") or "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80"
    partner["social"] = {
        "instagram": partner.get("instagram"),
        "website": partner.get("website"),
        "behance": partner.get("behance"),
        "facebook": partner.get("facebook"),
        "youtube": partner.get("youtube")
    }
    return partner

# =========================================================
# ADMIN API
# =========================================================

@app.get("/api/admin/overview", tags=["Admin"])
def get_admin_overview():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM bookings")
    total_bookings = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as pending FROM bookings WHERE status = 'PENDING'")
    pending_bookings = cursor.fetchone()["pending"]

    cursor.execute("SELECT COUNT(*) as confirmed FROM bookings WHERE status = 'CONFIRMED'")
    confirmed_bookings = cursor.fetchone()["confirmed"]

    cursor.execute("SELECT COUNT(*) as total FROM partners")
    total_partners = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as pending FROM partners WHERE status = 'PENDING'")
    pending_partners = cursor.fetchone()["pending"]

    cursor.execute("SELECT COUNT(*) as approved FROM partners WHERE status = 'APPROVED'")
    approved_partners = cursor.fetchone()["approved"]

    cursor.execute("SELECT COUNT(*) as total FROM portfolio_items")
    total_portfolio = cursor.fetchone()["total"]

    cursor.execute("SELECT * FROM bookings ORDER BY id DESC LIMIT 5")
    recent_bookings = []
    for r in cursor.fetchall():
        b = dict(r)
        try:
            b["details"] = json.loads(b.get("details_json") or "{}")
        except Exception:
            b["details"] = {}
        recent_bookings.append(b)

    conn.close()

    return {
        "bookings": {
            "total": total_bookings,
            "pending": pending_bookings,
            "confirmed": confirmed_bookings
        },
        "partners": {
            "total": total_partners,
            "pending": pending_partners,
            "approved": approved_partners
        },
        "portfolio": {
            "total": total_portfolio
        },
        "recent_bookings": recent_bookings
    }

@app.patch("/api/admin/partners/{partner_id}/status", tags=["Admin"])
def update_partner_approval_status(partner_id: int, payload: PartnerStatusUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM partners WHERE id = ?", (partner_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Partner not found")

    cursor.execute("UPDATE partners SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (payload.status.upper(), partner_id))
    conn.commit()

    cursor.execute("SELECT * FROM partners WHERE id = ?", (partner_id,))
    updated = dict(cursor.fetchone())
    updated.pop("password_hash", None)
    conn.close()

    return {"success": True, "partner": updated}

@app.patch("/api/admin/portfolio/{item_id}/status", tags=["Admin"])
def update_portfolio_item_status(item_id: int, payload: PortfolioStatusUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM portfolio_items WHERE id = ?", (item_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Portfolio item not found")

    cursor.execute("UPDATE portfolio_items SET status = ? WHERE id = ?", (payload.status.upper(), item_id))
    conn.commit()
    conn.close()

    return {"success": True, "item_id": item_id, "status": payload.status.upper()}

# =========================================================
# WHATSAPP ONE-CLICK PARTNER APPROVAL & REJECTION
# =========================================================

@app.get("/api/admin/partners/approve", response_class=HTMLResponse, tags=["Admin"])
def approve_partner_via_token(token: str = Query(...)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM partners WHERE approval_token = ?", (token.strip(),))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return HTMLResponse(
            content=render_approval_result_html(
                success=False,
                title="Verification Link Expired or Invalid",
                message="This partner verification token was not found or may have already been processed."
            ),
            status_code=404
        )

    partner = dict(row)
    cursor.execute("UPDATE partners SET status = 'APPROVED', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (partner["id"],))
    conn.commit()
    conn.close()

    return HTMLResponse(
        content=render_approval_result_html(
            success=True,
            title="Partner Approved & Live! 🎉",
            message=f"Partner <strong>{partner['name']}</strong> ({partner['profession']} in {partner['location']}) has been successfully approved! Their profile is now publicly live on SweepSage.",
            partner_slug=partner["slug"],
            partner_name=partner["name"]
        )
    )

@app.get("/api/admin/partners/reject", response_class=HTMLResponse, tags=["Admin"])
def reject_partner_via_token(token: str = Query(...)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM partners WHERE approval_token = ?", (token.strip(),))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return HTMLResponse(
            content=render_approval_result_html(
                success=False,
                title="Verification Link Expired or Invalid",
                message="This partner verification token was not found or may have already been processed."
            ),
            status_code=404
        )

    partner = dict(row)
    cursor.execute("UPDATE partners SET status = 'REJECTED', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (partner["id"],))
    conn.commit()
    conn.close()

    return HTMLResponse(
        content=render_approval_result_html(
            success=False,
            title="Partner Application Rejected",
            message=f"Application for <strong>{partner['name']}</strong> ({partner['profession']}) has been marked as REJECTED."
        )
    )

# =========================================================
# STATIC FILES SERVING (DIRECT FRONTEND HOSTING)
# =========================================================

# Serve index.html at root
@app.get("/", include_in_schema=False)
def serve_index():
    index_file = PROJECT_ROOT / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "SweepSage API is running. Visit /docs for Swagger documentation."}

# Serve favicon.ico directly for browsers
@app.get("/favicon.ico", include_in_schema=False)
def serve_favicon():
    favicon_file = PROJECT_ROOT / "favicon.ico"
    if favicon_file.exists():
        return FileResponse(favicon_file, media_type="image/x-icon")
    logo_file = PROJECT_ROOT / "logo.png"
    if logo_file.exists():
        return FileResponse(logo_file, media_type="image/png")
    raise HTTPException(status_code=404, detail="Favicon not found")


# Serve robots.txt directly with correct MIME type
@app.get("/robots.txt", include_in_schema=False)
def serve_robots_txt():
    robots_file = PROJECT_ROOT / "robots.txt"
    if robots_file.exists():
        return FileResponse(robots_file, media_type="text/plain")
    raise HTTPException(status_code=404, detail="robots.txt not found")

# Serve sitemap.xml directly with correct XML MIME type
@app.get("/sitemap.xml", include_in_schema=False)
def serve_sitemap_xml():
    sitemap_file = PROJECT_ROOT / "sitemap.xml"
    if sitemap_file.exists():
        return FileResponse(sitemap_file, media_type="application/xml")
    raise HTTPException(status_code=404, detail="sitemap.xml not found")

# Mount uploads directory for uploaded media files (photos, videos, posters)
UPLOADS_DIR = PROJECT_ROOT / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Mount project static directory for HTML, CSS, JS, Images
app.mount("/", StaticFiles(directory=str(PROJECT_ROOT), html=True), name="static")
