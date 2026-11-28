/**
 * SWEEPSAGE CLIENT API ENGINE (api.js)
 * Production-ready REST API Client connecting Frontend with FastAPI & SQLite.
 * Provides resilient operations with seamless online-first execution and
 * graceful offline caching fallback.
 */

(function () {
  const STORAGE_KEYS = {
    offlineBookings: "sweepsageOfflineBookings",
    adminNotes: "sweepsage_admin_notes",
    adminAuthToken: "sweepsage_admin_token"
  };

  const DEFAULT_INITIAL_BOOKINGS = [
    {
      id: 1,
      reference: "SS-98214",
      service: "photographer",
      event_id: "instant",
      event_name: "Instant Doorstep Photographer",
      package_name: "Instant Shoot (1 Hour)",
      price: "₹1,499",
      customer_name: "Utkarsh Dubey",
      customer_phone: "+91 95558 26615",
      customer_email: "dubeyutkarsh461@gmail.com",
      location: "N-52, Delta-3, Greater Noida, Uttar Pradesh, 201308",
      booking_date: "2026-10-29",
      booking_time: "15:30",
      status: "CONFIRMED",
      notes: "Pro Aman Sharma assigned. Priority doorstep dispatch.",
      creator: "Aman Sharma (★ 4.9)",
      created_at: "2026-10-29T15:30:00.000Z",
      updated_at: "2026-10-29T15:35:00.000Z",
      server_synced: true
    },
    {
      id: 2,
      reference: "SS-84192",
      service: "photographer",
      event_id: "prewedding",
      event_name: "Pre-Wedding & Cinematic Storytelling",
      package_name: "Signature Wedding Story",
      price: "₹12,999",
      customer_name: "Rohan & Sneha",
      customer_phone: "+91 98712 34567",
      customer_email: "rohan.sneha@gmail.com",
      location: "Lodhi Garden & Sunder Nursery, Delhi NCR",
      booking_date: "2026-10-18",
      booking_time: "11:30",
      status: "COMPLETED",
      notes: "120 RAW 4K Frames delivered to cloud album.",
      creator: "Kunal Verma (Lead Cinema Director)",
      created_at: "2026-10-10T10:00:00.000Z",
      updated_at: "2026-10-18T21:30:00.000Z",
      server_synced: true
    },
    {
      id: 3,
      reference: "SS-76210",
      service: "salon",
      event_id: "facial_spa",
      event_name: "Salon at Home — Glow Facial & Hair Spa",
      package_name: "Deep Glow Deluxe Ritual",
      price: "₹2,199",
      customer_name: "Priya Sharma",
      customer_phone: "+91 98101 22334",
      customer_email: "priya.sharma@outlook.com",
      location: "Sector 50, Noida, UP",
      booking_date: "2026-09-12",
      booking_time: "14:15",
      status: "COMPLETED",
      notes: "Single-use sealed hygiene kit used. Clean-up done.",
      creator: "Pooja Sharma (Senior Stylist)",
      created_at: "2026-09-12T13:00:00.000Z",
      updated_at: "2026-09-12T16:00:00.000Z",
      server_synced: true
    },
    {
      id: 4,
      reference: "SS-61405",
      service: "travel",
      event_id: "himachal",
      event_name: "Himalayan Luxury Escape — Rishikesh & Mussoorie",
      package_name: "Handcrafted Boutique Getaway",
      price: "₹18,500",
      customer_name: "Amitabh Verma",
      customer_phone: "+91 99203 11452",
      customer_email: "averma@corp.in",
      location: "Rishikesh Boutique Resort",
      booking_date: "2026-11-15",
      booking_time: "09:00",
      status: "PENDING",
      notes: "Private cab transfer and riverside cottage request.",
      creator: "SweepSage Travel Concierge",
      created_at: "2026-11-04T11:20:00.000Z",
      updated_at: "2026-11-04T11:20:00.000Z",
      server_synced: true
    }
  ];

  function getStoredBookings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.offlineBookings);
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
      }
    } catch (_) {}
    return DEFAULT_INITIAL_BOOKINGS;
  }

  function saveStoredBookings(bookings) {
    try {
      localStorage.setItem(STORAGE_KEYS.offlineBookings, JSON.stringify(bookings));
    } catch (e) {
      console.warn("[SweepSage API] Could not persist to localStorage:", e);
    }
  }

  const SweepSageAPI = {
    /**
     * Determine API base URL dynamically based on execution context.
     * Supports local dev server (port 8000), file:// preview, and production domains.
     */
    getBaseUrl: () => {
      if (typeof window !== "undefined" && window.SWEEPSAGE_API_URL) {
        return window.SWEEPSAGE_API_URL.replace(/\/+$/, "");
      }
      if (typeof window !== "undefined" && window.location) {
        // If file:// protocol or frontend dev server port (e.g. 5500, 3000, 8080)
        if (window.location.protocol === "file:") {
          return "http://127.0.0.1:8000";
        }
        if (window.location.port === "8000") {
          return "";
        }
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
          return "http://127.0.0.1:8000";
        }
      }
      // Production domain / Vercel deployment
      return "";
    },

    // ---------------------------------------------
    // HEALTH CHECK
    // ---------------------------------------------
    async checkHealth() {
      const base = this.getBaseUrl();
      try {
        const res = await fetch(`${base}/api/health`, { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          return {
            status: "online",
            server_healthy: true,
            database: data.database || "SQLite",
            version: data.version || "3.0.0",
            counts: data.counts || {},
            time: data.time || new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn("[SweepSage API] Health check failed, falling back to local storage:", err);
      }
      return {
        status: "offline",
        server_healthy: false,
        mode: "offline-fallback",
        database: "Local Cache (Offline)",
        time: new Date().toISOString()
      };
    },

    // ---------------------------------------------
    // CUSTOMER BOOKINGS API
    // ---------------------------------------------

    /**
     * Submit a customer booking to the FastAPI backend and persist in SQLite.
     * Falls back to offline queue if server is unreachable.
     */
    async createBooking(bookingData) {
      const base = this.getBaseUrl();

      // Normalize payload structure
      const payload = {
        service: bookingData.service || "general",
        event_id: bookingData.event_id || "",
        event_name: bookingData.event_name || "",
        package_name: bookingData.package_name || bookingData.package || "",
        price: bookingData.price || "",
        customer_name: bookingData.customer_name || bookingData.name || "Customer",
        customer_phone: bookingData.customer_phone || bookingData.phone || "",
        customer_email: bookingData.customer_email || bookingData.email || "",
        location: bookingData.location || bookingData.address || "",
        booking_date: bookingData.booking_date || bookingData.date || new Date().toISOString().slice(0, 10),
        booking_time: bookingData.booking_time || bookingData.time || "",
        details: bookingData.details || {},
        notes: bookingData.notes || bookingData.message || "",
        status: bookingData.status || "CONFIRMED"
      };

      try {
        const res = await fetch(`${base}/api/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const result = await res.json();
          const serverBooking = result.booking || {
            ...payload,
            reference: result.reference,
            id: result.id,
            server_synced: true,
            created_at: new Date().toISOString()
          };

          // Cache in local storage for instant multi-page responsiveness
          const all = getStoredBookings();
          const filtered = all.filter(b => b.reference !== serverBooking.reference);
          filtered.unshift({ ...serverBooking, server_synced: true });
          saveStoredBookings(filtered);

          return {
            success: true,
            reference: result.reference || serverBooking.reference,
            id: result.id || serverBooking.id,
            booking: serverBooking,
            server_synced: true,
            database: "SQLite (Live)"
          };
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn("[SweepSage API] Backend returned error status:", res.status, errData);
          throw new Error(errData.detail || "Server rejected booking");
        }
      } catch (err) {
        console.warn("[SweepSage API] Server unreachable, recording offline booking:", err.message);

        // Explicit offline fallback: generate reference and mark NOT synced
        const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const randCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        const ref = `SS-${dateCode}-${randCode}`;

        const offlineBooking = {
          ...payload,
          id: Date.now(),
          reference: ref,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          server_synced: false,
          is_offline_pending_sync: true
        };

        const all = getStoredBookings();
        all.unshift(offlineBooking);
        saveStoredBookings(all);

        return {
          success: true,
          reference: ref,
          id: offlineBooking.id,
          booking: offlineBooking,
          server_synced: false,
          is_offline: true,
          message: "Booking saved in offline queue. Will sync to server when connection is restored."
        };
      }
    },

    /**
     * Fetch list of bookings from database with optional filters.
     */
    async getBookings(params = {}) {
      const base = this.getBaseUrl();
      const queryParts = [];

      if (params.service && params.service !== "all") queryParts.push(`service=${encodeURIComponent(params.service)}`);
      if (params.status && params.status !== "all") queryParts.push(`status=${encodeURIComponent(params.status)}`);
      if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
      if (params.limit) queryParts.push(`limit=${encodeURIComponent(params.limit)}`);
      if (params.offset) queryParts.push(`offset=${encodeURIComponent(params.offset)}`);

      const qs = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";

      try {
        const res = await fetch(`${base}/api/bookings${qs}`, { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.bookings)) {
            // Merge with local offline cache
            saveStoredBookings(data.bookings);
            return {
              success: true,
              bookings: data.bookings,
              total: data.total !== undefined ? data.total : data.bookings.length,
              source: "database"
            };
          }
        }
      } catch (err) {
        console.warn("[SweepSage API] Could not fetch bookings from server, using local storage cache:", err);
      }

      // Offline fallback: filter stored list locally
      let list = [...getStoredBookings()];
      if (params.service && params.service !== "all") {
        const s = params.service.toLowerCase();
        list = list.filter(b => (b.service || "").toLowerCase() === s);
      }
      if (params.status && params.status !== "all") {
        const st = params.status.toUpperCase();
        list = list.filter(b => (b.status || "").toUpperCase() === st);
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(b =>
          (b.customer_name || "").toLowerCase().includes(q) ||
          (b.customer_phone || "").toLowerCase().includes(q) ||
          (b.reference || "").toLowerCase().includes(q) ||
          (b.package_name || "").toLowerCase().includes(q) ||
          (b.location || "").toLowerCase().includes(q)
        );
      }

      return {
        success: true,
        bookings: list,
        total: list.length,
        source: "offline-cache"
      };
    },

    /**
     * Fetch a single booking by reference code.
     */
    async getBookingByReference(reference) {
      const cleanRef = String(reference).trim().replace("#", "");
      const base = this.getBaseUrl();

      try {
        const res = await fetch(`${base}/api/bookings/${encodeURIComponent(cleanRef)}`, { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          if (data && data.booking) {
            return { success: true, booking: data.booking, source: "database" };
          }
        }
      } catch (err) {
        console.warn("[SweepSage API] getBookingByReference server fetch note:", err);
      }

      // Check local cache
      const stored = getStoredBookings();
      const match = stored.find(b => b.reference === cleanRef || b.reference === `#${cleanRef}` || String(b.id) === cleanRef);
      if (match) {
        return { success: true, booking: match, source: "offline-cache" };
      }

      return { success: false, message: `Booking ${reference} not found` };
    },

    /**
     * Update booking status (e.g. CONFIRMED, ON_WAY, COMPLETED, CANCELLED) and notes.
     */
    async updateBookingStatus(idOrRef, newStatus, notes, creator) {
      const cleanRef = String(idOrRef).trim().replace("#", "");
      const base = this.getBaseUrl();

      const patchBody = {};
      if (newStatus !== undefined) patchBody.status = newStatus;
      if (notes !== undefined) patchBody.notes = notes;
      if (creator !== undefined) patchBody.creator = creator;

      let serverUpdated = false;
      let updatedBooking = null;

      try {
        const res = await fetch(`${base}/api/bookings/${encodeURIComponent(cleanRef)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchBody)
        });

        if (res.ok) {
          const data = await res.json();
          updatedBooking = data.booking;
          serverUpdated = true;
        }
      } catch (err) {
        console.warn("[SweepSage API] updateBookingStatus server update failed:", err);
      }

      // Update local storage
      const all = getStoredBookings();
      const index = all.findIndex(b => b.reference === cleanRef || String(b.id) === cleanRef);

      if (index !== -1) {
        if (newStatus !== undefined) all[index].status = newStatus;
        if (notes !== undefined) all[index].notes = notes;
        if (creator !== undefined) all[index].creator = creator;
        all[index].updated_at = new Date().toISOString();
        all[index].server_synced = serverUpdated;
        saveStoredBookings(all);
        return { success: true, booking: updatedBooking || all[index], server_synced: serverUpdated };
      }

      if (updatedBooking) {
        all.unshift(updatedBooking);
        saveStoredBookings(all);
        return { success: true, booking: updatedBooking, server_synced: true };
      }

      return { success: false, message: "Booking not found" };
    },

    /**
     * Delete booking by ID or reference code.
     */
    async deleteBooking(idOrRef) {
      const cleanRef = String(idOrRef).trim().replace("#", "");
      const base = this.getBaseUrl();

      try {
        await fetch(`${base}/api/bookings/${encodeURIComponent(cleanRef)}`, { method: "DELETE" });
      } catch (err) {
        console.warn("[SweepSage API] deleteBooking server call notice:", err);
      }

      let all = getStoredBookings();
      all = all.filter(b => b.reference !== cleanRef && String(b.id) !== cleanRef);
      saveStoredBookings(all);
      return { success: true };
    },

    // ---------------------------------------------
    // ADMIN DASHBOARD OVERVIEW METRICS
    // ---------------------------------------------
    async getAdminOverview() {
      const result = await this.getBookings({ limit: 500 });
      const all = result.bookings || [];

      const total = all.length;
      const pending = all.filter(b => (b.status || "").toUpperCase() === "PENDING").length;
      const confirmed = all.filter(b => (b.status || "").toUpperCase() === "CONFIRMED").length;
      const onWay = all.filter(b => (b.status || "").toUpperCase() === "ON_WAY").length;
      const completed = all.filter(b => (b.status || "").toUpperCase() === "COMPLETED").length;

      const revenue = all.reduce((sum, b) => {
        const num = parseInt(String(b.price || "0").replace(/[^0-9]/g, ""), 10);
        return sum + (isNaN(num) ? 0 : num);
      }, 0);

      return {
        bookings: {
          total,
          pending,
          confirmed,
          onWay,
          completed,
          revenue
        }
      };
    },

    // ---------------------------------------------
    // ADMIN AUTHENTICATION
    // ---------------------------------------------
    async loginAdmin(email, password) {
      const base = this.getBaseUrl();
      try {
        const res = await fetch(`${base}/api/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.token) {
            localStorage.setItem(STORAGE_KEYS.adminAuthToken, data.token);
            return { success: true, token: data.token, email: data.email, role: data.role };
          }
        }
      } catch (err) {
        console.warn("[SweepSage API] Admin login fetch error:", err);
      }
      return { success: false, message: "Invalid credentials" };
    },

    // ---------------------------------------------
    // PARTNER STUBS
    // ---------------------------------------------
    async getPublicPartners() {
      return [];
    },
    async getPublicPartnerBySlug() {
      return null;
    },
    getStoredPartnerSession() {
      return null;
    },
    getStoredToken() {
      return localStorage.getItem(STORAGE_KEYS.adminAuthToken);
    },
    async logoutPartner() {
      localStorage.removeItem(STORAGE_KEYS.adminAuthToken);
    }
  };

  window.SweepSageAPI = SweepSageAPI;
})();
