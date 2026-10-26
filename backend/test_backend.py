import sys
import json
import urllib.request
import urllib.error

# Ensure UTF-8 output on Windows
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_URL = "http://127.0.0.1:8000"

def request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        headers["X-Partner-Token"] = token
    encoded_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            try:
                return resp.status, json.loads(content)
            except Exception:
                return resp.status, content
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(content)
        except Exception:
            return e.code, content

def run_tests():
    print("Testing SweepSage Backend API...")

    # 1. Health
    status, res = request("/api/health")
    assert status == 200 and res.get("status") == "online", f"Health check failed: {res}"
    print("✓ 1. Health check passed")

    # 2. Create Bookings
    bookings_data = [
        {
            "service": "photographer",
            "event_id": "wedding",
            "event_name": "Wedding",
            "package_name": "Full Day Cinematography",
            "price": "₹65,000/-",
            "customer_name": "Rohan Malhotra",
            "customer_phone": "+91 98111 22233",
            "customer_email": "rohan@example.com",
            "location": "Udaipur, Rajasthan",
            "booking_date": "2026-12-10",
            "booking_time": "10:00 AM",
            "notes": "Looking for traditional and candid coverage with drone reels."
        },
        {
            "service": "salon",
            "event_id": "bridal",
            "event_name": "Bridal Glam",
            "package_name": "Luxury HD Bridal Package",
            "price": "₹18,500/-",
            "customer_name": "Simran Kaur",
            "customer_phone": "+91 98222 33344",
            "customer_email": "simran@example.com",
            "location": "South Delhi",
            "booking_date": "2026-11-20",
            "booking_time": "02:00 PM",
            "notes": "Bridal makeup and hair styling at home."
        },
        {
            "service": "travel",
            "event_id": "honeymoon",
            "event_name": "Honeymoon Escape",
            "package_name": "Kashmir Serenade Tour",
            "price": "₹85,000/-",
            "customer_name": "Kavita Reddy",
            "customer_phone": "+91 98333 44455",
            "customer_email": "kavita@example.com",
            "location": "Kashmir",
            "booking_date": "2026-11-25",
            "notes": "Srinagar houseboat + Gulmarg ski experience."
        }
    ]

    created_refs = []
    created_ids = []
    for b in bookings_data:
        status, res = request("/api/bookings", method="POST", data=b)
        assert status == 201 and res.get("success") is True, f"Booking creation failed: {res}"
        created_refs.append(res["reference"])
        created_ids.append(res["booking"]["id"])
    print(f"✓ 2. Created {len(created_refs)} bookings (References: {', '.join(created_refs)})")

    # 3. List Bookings
    status, res = request("/api/bookings")
    assert status == 200 and res.get("total", 0) >= 3, f"Listing bookings failed: {res}"
    print(f"✓ 3. Listed bookings (Total in DB: {res['total']})")

    # 4. Update Booking Status
    test_booking_id = created_ids[0]
    status, res = request(f"/api/bookings/{test_booking_id}/status", method="PATCH", data={"status": "CONFIRMED", "notes": "Confirmed by concierge team"})
    assert status == 200 and res["booking"]["status"] == "CONFIRMED", f"Update booking status failed: {res}"
    print(f"✓ 4. Updated booking #{test_booking_id} status to CONFIRMED")

    # 5. Partner Registration
    test_partner_email = f"test.creator.{abs(hash('test')) % 10000}@sweepsage.com"
    status, res = request("/api/partners/register", method="POST", data={
        "name": "Dev Sharma",
        "email": test_partner_email,
        "password": "SecurePassword123!",
        "phone": "+91 99999 11111",
        "profession": "Videographer",
        "location": "Mumbai",
        "bio": "Award winning visual creator."
    })
    assert status == 201 and res.get("success") is True, f"Partner registration failed: {res}"
    registered_partner_id = res["partner"]["id"]
    print(f"✓ 5. Registered partner: {res['partner']['name']} (Status: {res['partner']['status']})")

    # 6. Partner Login
    status, res = request("/api/partners/login", method="POST", data={
        "email": test_partner_email,
        "password": "SecurePassword123!"
    })
    assert status == 200 and "token" in res, f"Partner login failed: {res}"
    token = res["token"]
    print("✓ 6. Partner login successful, received session token")

    # 7. Get Partner Me
    status, res = request("/api/partners/me", token=token)
    assert status == 200 and res["email"] == test_partner_email, f"Get partner me failed: {res}"
    print("✓ 7. Verified current partner profile from /api/partners/me")

    # 8. Update Partner Profile
    status, res = request("/api/partners/me", method="PUT", token=token, data={
        "bio": "Updated bio with 8 years of luxury wedding cinematography experience.",
        "location": "Mumbai & Goa"
    })
    assert status == 200 and "Mumbai & Goa" in res["partner"]["location"], f"Update profile failed: {res}"
    print("✓ 8. Updated partner profile via PUT /api/partners/me")

    # 9. Upload Portfolio Item
    status, res = request("/api/partners/me/portfolio", method="POST", token=token, data={
        "title": "Goa Beach Romance Teaser",
        "type": "Videos",
        "media_type": "video",
        "src": "https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080.mp4",
        "poster": "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80"
    })
    assert status == 201 and res.get("success") is True, f"Portfolio upload failed: {res}"
    portfolio_item_id = res["item"]["id"]
    print(f"✓ 9. Uploaded portfolio item #{portfolio_item_id}: {res['item']['title']}")

    # 10. Admin Overview
    status, res = request("/api/admin/overview")
    assert status == 200 and res["bookings"]["total"] >= 3, f"Admin overview failed: {res}"
    print(f"✓ 10. Admin overview verified (Total bookings: {res['bookings']['total']}, Verified partners: {res['partners']['approved']})")

    # 11. Admin Partner Approval
    status, res = request(f"/api/admin/partners/{registered_partner_id}/status", method="PATCH", data={"status": "APPROVED"})
    assert status == 200 and res["partner"]["status"] == "APPROVED", f"Admin partner approval failed: {res}"
    print(f"✓ 11. Admin approved partner #{registered_partner_id} to status APPROVED")

    # 12. Public Partners List
    status, res = request("/api/partners")
    assert status == 200 and len(res) > 0, f"Public partners list failed: {res}"
    print(f"✓ 12. Public partners list returned {len(res)} verified creators")

    # 13. Static Files & Admin Console HTML
    status, html_content = request("/admin.html")
    assert status == 200 and "SweepSage Operations" in html_content, "admin.html serving failed"
    status, index_content = request("/")
    assert status == 200 and "SweepSage" in index_content, "index.html serving failed"
    print("✓ 13. Frontend HTML and Admin Console (admin.html) verified accessible at root and routes")

    print("\n=======================================================")
    print("🎉 ALL 13 BACKEND & API TESTS PASSED SUCCESSFULLY!")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()
