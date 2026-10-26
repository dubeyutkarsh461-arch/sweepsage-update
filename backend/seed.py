from .database import get_db_connection, init_db

# Partners are now dynamically registered and verified via WhatsApp (9555826615)
DEFAULT_PARTNERS = []

def seed_database():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) AS count FROM partners")
    count = cursor.fetchone()["count"]
    conn.close()
    return count > 0

if __name__ == "__main__":
    init_db()
    print("Database initialized. Ready for partner registrations via WhatsApp approval.")
