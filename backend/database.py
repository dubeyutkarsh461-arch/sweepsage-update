import os
import sqlite3
import json
from datetime import datetime
from pathlib import Path

# Database path
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "sweepsage.db"

def get_db_connection():
    """Create a thread-safe connection to the SQLite database."""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    """Initialize database tables if they do not already exist."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Bookings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT UNIQUE NOT NULL,
        service TEXT NOT NULL,
        event_id TEXT,
        event_name TEXT,
        package_name TEXT,
        price TEXT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT,
        location TEXT,
        booking_date TEXT,
        booking_time TEXT,
        details_json TEXT,
        status TEXT DEFAULT 'PENDING',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Partners table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS partners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        profession TEXT NOT NULL,
        location TEXT NOT NULL,
        bio TEXT,
        rating REAL DEFAULT 4.9,
        profile_image TEXT,
        status TEXT DEFAULT 'PENDING',
        instagram TEXT,
        website TEXT,
        behance TEXT,
        facebook TEXT,
        youtube TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approval_token TEXT
    );
    """)

    # Ensure approval_token column exists if table was already created
    try:
        cursor.execute("ALTER TABLE partners ADD COLUMN approval_token TEXT")
        conn.commit()
    except Exception:
        pass

    # 3. Portfolio Items table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS portfolio_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        partner_id INTEGER NOT NULL,
        item_uid TEXT UNIQUE,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        media_type TEXT NOT NULL,
        src TEXT NOT NULL,
        poster TEXT,
        status TEXT DEFAULT 'APPROVED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (partner_id) REFERENCES partners (id) ON DELETE CASCADE
    );
    """)

    # 4. Partner Sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS partner_sessions (
        token TEXT PRIMARY KEY,
        partner_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        FOREIGN KEY (partner_id) REFERENCES partners (id) ON DELETE CASCADE
    );
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)
