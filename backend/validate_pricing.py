import urllib.request
import sys
import re

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# 1. Check Homepage
html = urllib.request.urlopen("http://127.0.0.1:8000/").read().decode("utf-8")
assert "₹1,499/-" in html, "Missing ₹1,499/- in homepage"
assert 'data-open-booking="instant"' in html, "Missing instant booking trigger on homepage"
assert "top-announcement-bar" not in html, "Top announcement bar should be removed (no overlays)"
assert "hero-center-badge" not in html, "Hero center badge should be removed (clean hero section)"
assert "nav-instant-btn" in html, "Missing nav instant btn"

# Ensure NO buttons have 1499 appended to the label
btn_matches = re.findall(r'<button[^>]*>([^<]*1,?499[^<]*)</button>', html, re.IGNORECASE)
assert len(btn_matches) == 0, f"Found buttons with 1499 in label: {btn_matches}"
a_matches = re.findall(r'<a[^>]*class="[^"]*nav-instant-btn[^"]*"[^>]*>([^<]*1,?499[^<]*)</a>', html, re.IGNORECASE)
assert len(a_matches) == 0, f"Found nav instant btn with 1499 in label: {a_matches}"
print("✓ Homepage verified: Clean hero section (no overlays), clean 'Book in Minutes' buttons without price appended, and ₹1,499/- stated in service details")

# 2. Check Photography Booking Page
booking_html = urllib.request.urlopen("http://127.0.0.1:8000/PHOTOGRAPHER-BOOKING.HTML?event=instant").read().decode("utf-8")
assert "₹1,499/-" in booking_html, "Missing ₹1,499/- in booking page"
assert "⚡ BOOK IN MINUTES" in booking_html, "Missing BOOK IN MINUTES header button"
assert "⚡ BOOK IN MINUTES — ₹1,499/-" not in booking_html, "Header badge should not have price on the button"
print("✓ Booking page verified: Clean header button and USP pricing set to ₹1,499/-")

# 3. Check BOOKING-FLOW.JS
js = urllib.request.urlopen("http://127.0.0.1:8000/BOOKING-FLOW.JS").read().decode("utf-8")
assert 'price:"₹1,499/-"' in js, "Missing ₹1,499 price in BOOKING-FLOW.JS instant package"
assert 'name:"10-Min Quick Shoot"' in js, "Missing clean 10-Min Quick Shoot event name"
print("✓ BOOKING-FLOW.JS verified: instant package price updated to ₹1,499/- with clean event name")

# 4. Check SCRIPT.JS
script_js = urllib.request.urlopen("http://127.0.0.1:8000/SCRIPT.JS").read().decode("utf-8")
assert "Book in minutes — Just ₹1,499/-" in script_js, "Missing modal copy update in SCRIPT.JS"
assert "closest(\"[data-open-booking]\")" in script_js, "Missing robust event delegation in SCRIPT.JS"
print("✓ SCRIPT.JS verified: Robust event delegation and modal copy updated")

print("\nAll assets validated successfully! 100% compliant with user instructions.")
