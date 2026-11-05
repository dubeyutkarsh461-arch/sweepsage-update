/**
 * SWEEPSAGE CLIENT API ENGINE
 * Pure client-side resilient operations engine for bookings, admin console,
 * and order tracking with instant LocalStorage persistence and zero backend dependency.
 */

(function () {
  const STORAGE_KEYS = {
    offlineBookings: "sweepsageOfflineBookings",
    adminNotes: "sweepsage_admin_notes"
  };

  const DEFAULT_INITIAL_BOOKINGS = [
    {
      id: 1,
      reference: "SS-98214",
      service: "photographer",
      event_id: "instant",
      event_name: "Instant Doorstep Photographer",
      package_name: "10-Min Doorstep Portrait Session",
      price: "₹1,499",
      customer_name: "Utkarsh Dubey",
      customer_phone: "+91 95558 26615",
      customer_email: "dubeyutkarsh461@gmail.com",
      location: "N-52, Delta-3, Greater Noida, Uttar Pradesh, 201308",
      booking_date: "2026-10-29",
      booking_time: "15:30",
      status: "CONFIRMED",
      notes: "Pro Aman Sharma assigned. Priority doorstep dispatch.",
      created_at: "2026-10-29T15:30:00.000Z",
      updated_at: "2026-10-29T15:35:00.000Z"
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
      created_at: "2026-10-10T10:00:00.000Z",
      updated_at: "2026-10-18T21:30:00.000Z"
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
      created_at: "2026-09-12T13:00:00.000Z",
      updated_at: "2026-09-12T16:00:00.000Z"
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
      created_at: "2026-11-04T11:20:00.000Z",
      updated_at: "2026-11-04T11:20:00.000Z"
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
    try {
      localStorage.setItem(STORAGE_KEYS.offlineBookings, JSON.stringify(DEFAULT_INITIAL_BOOKINGS));
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
    getBaseUrl: () => "",

    // ---------------------------------------------
    // HEALTH
    // ---------------------------------------------
    async checkHealth() {
      return {
        status: "online",
        mode: "client-storage",
        service: "SweepSage Operations",
        time: new Date().toISOString()
      };
    },

    // ---------------------------------------------
    // BOOKINGS
    // ---------------------------------------------
    async createBooking(bookingData) {
      const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      const ref = `SS-${dateCode}-${randCode}`;

      const newBooking = {
        id: Date.now(),
        reference: ref,
        service: bookingData.service || "general",
        event_id: bookingData.event_id || "",
        event_name: bookingData.event_name || "",
        package_name: bookingData.package_name || "",
        price: bookingData.price || "",
        customer_name: bookingData.customer_name || "Valued Customer",
        customer_phone: bookingData.customer_phone || "",
        customer_email: bookingData.customer_email || "",
        location: bookingData.location || "",
        booking_date: bookingData.booking_date || new Date().toISOString().slice(0, 10),
        booking_time: bookingData.booking_time || "",
        details: bookingData.details || {},
        status: "PENDING",
        notes: bookingData.notes || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const all = getStoredBookings();
      all.unshift(newBooking);
      saveStoredBookings(all);

      return {
        success: true,
        reference: ref,
        booking: newBooking
      };
    },

    async getBookings(params = {}) {
      let list = [...getStoredBookings()];

      if (params.service) {
        const s = params.service.toLowerCase();
        list = list.filter(b => (b.service || "").toLowerCase() === s);
      }

      if (params.status) {
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
        bookings: list,
        total: list.length
      };
    },

    async updateBookingStatus(id, newStatus, notes) {
      const all = getStoredBookings();
      const index = all.findIndex(b => b.id == id || b.reference === id);

      if (index !== -1) {
        all[index].status = newStatus;
        if (notes !== undefined) {
          all[index].notes = notes;
        }
        all[index].updated_at = new Date().toISOString();
        saveStoredBookings(all);
        return { success: true, booking: all[index] };
      }
      return { success: false, message: "Booking not found" };
    },

    async deleteBooking(id) {
      let all = getStoredBookings();
      all = all.filter(b => b.id != id && b.reference !== id);
      saveStoredBookings(all);
      return { success: true };
    },

    // ---------------------------------------------
    // ADMIN OVERVIEW
    // ---------------------------------------------
    async getAdminOverview() {
      const all = getStoredBookings();
      const total = all.length;
      const pending = all.filter(b => (b.status || "").toUpperCase() === "PENDING").length;
      const confirmed = all.filter(b => (b.status || "").toUpperCase() === "CONFIRMED").length;
      const completed = all.filter(b => (b.status || "").toUpperCase() === "COMPLETED").length;

      return {
        bookings: {
          total,
          pending,
          confirmed,
          completed
        }
      };
    },

    // ---------------------------------------------
    // PARTNER DIRECTORY COMPATIBILITY STUBS
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
      return null;
    },
    async logoutPartner() {}
  };

  window.SweepSageAPI = SweepSageAPI;
})();
