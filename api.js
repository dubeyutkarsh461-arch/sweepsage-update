/**
 * SWEEPSAGE API CLIENT
 * Connects frontend booking flows, partner portal, and admin views
 * to the Python FastAPI + SQLite backend with seamless offline fallback.
 */

(function () {
  // Determine API base: Use current origin if on backend port (8000) or deployed domain; default to 127.0.0.1:8000
  let API_BASE = "http://127.0.0.1:8000";
  try {
    const loc = window.location;
    if (loc.origin && loc.origin.startsWith("http")) {
      if (loc.port === "8000") {
        API_BASE = loc.origin;
      } else if (loc.hostname && loc.hostname !== "localhost" && loc.hostname !== "127.0.0.1") {
        API_BASE = loc.origin;
      } else {
        API_BASE = `http://${loc.hostname || "127.0.0.1"}:8000`;
      }
    }
  } catch (_e) {
    API_BASE = "http://127.0.0.1:8000";
  }

  const STORAGE_KEYS = {
    token: "sweepsagePartnerToken",
    session: "sweepsagePartnerSession",
    offlineBookings: "sweepsageOfflineBookings",
    partnersCache: "sweepsagePartnersData"
  };

  async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    const token = localStorage.getItem(STORAGE_KEYS.token);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["X-Partner-Token"] = token;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = (data && (data.detail || data.message)) || `HTTP ${response.status}`;
        const error = new Error(errorMsg);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      // If server is not responding at current origin and origin wasn't 8000, try 8000
      if (API_BASE !== "http://127.0.0.1:8000" && err.name === "TypeError") {
        API_BASE = "http://127.0.0.1:8000";
        return request(endpoint, options);
      }
      throw err;
    }
  }

  const SweepSageAPI = {
    getBaseUrl: () => API_BASE,

    // ---------------------------------------------
    // HEALTH
    // ---------------------------------------------
    async checkHealth() {
      try {
        return await request("/api/health");
      } catch (err) {
        return { status: "offline", error: err.message };
      }
    },

    // ---------------------------------------------
    // BOOKINGS
    // ---------------------------------------------
    async createBooking(bookingData) {
      try {
        const res = await request("/api/bookings", {
          method: "POST",
          body: JSON.stringify(bookingData)
        });
        return res;
      } catch (err) {
        console.warn("[SweepSage API] Backend unreachable, caching booking locally:", err.message);
        // Resilient fallback: store locally
        const ref = "SS-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
        const fallbackBooking = {
          ...bookingData,
          reference: ref,
          created_at: new Date().toISOString(),
          status: "PENDING_OFFLINE"
        };
        try {
          const offline = JSON.parse(localStorage.getItem(STORAGE_KEYS.offlineBookings) || "[]");
          offline.unshift(fallbackBooking);
          localStorage.setItem(STORAGE_KEYS.offlineBookings, JSON.stringify(offline));
        } catch (_) {}
        return {
          success: true,
          reference: ref,
          booking: fallbackBooking,
          offline: true
        };
      }
    },

    async getBookings(params = {}) {
      const query = new URLSearchParams();
      if (params.service) query.set("service", params.service);
      if (params.status) query.set("status", params.status);
      if (params.search) query.set("search", params.search);
      if (params.limit) query.set("limit", params.limit);
      if (params.offset) query.set("offset", params.offset);

      const qs = query.toString() ? `?${query.toString()}` : "";
      return await request(`/api/bookings${qs}`);
    },

    async updateBookingStatus(id, newStatus, notes) {
      return await request(`/api/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus, notes })
      });
    },

    async deleteBooking(id) {
      return await request(`/api/bookings/${id}`, {
        method: "DELETE"
      });
    },

    // ---------------------------------------------
    // PARTNER PORTAL & AUTH
    // ---------------------------------------------
    async registerPartner(payload) {
      return await request("/api/partners/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },

    async loginPartner(email, password) {
      const res = await request("/api/partners/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      if (res && res.token) {
        localStorage.setItem(STORAGE_KEYS.token, res.token);
        localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(res.partner));
      }
      return res;
    },

    async logoutPartner() {
      try {
        await request("/api/partners/logout", { method: "POST" });
      } catch (_) {}
      localStorage.removeItem(STORAGE_KEYS.token);
      localStorage.removeItem(STORAGE_KEYS.session);
    },

    getStoredPartnerSession() {
      const session = localStorage.getItem(STORAGE_KEYS.session);
      if (!session) return null;
      try {
        return JSON.parse(session);
      } catch (_) {
        return null;
      }
    },

    getStoredToken() {
      return localStorage.getItem(STORAGE_KEYS.token);
    },

    async getPartnerMe() {
      return await request("/api/partners/me");
    },

    async updatePartnerProfile(profileData) {
      const res = await request("/api/partners/me", {
        method: "PUT",
        body: JSON.stringify(profileData)
      });
      if (res && res.partner) {
        localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(res.partner));
      }
      return res;
    },

    async uploadPortfolio(itemData) {
      return await request("/api/partners/me/portfolio", {
        method: "POST",
        body: JSON.stringify(itemData)
      });
    },

    async uploadPartnerMediaFile(formData) {
      const url = `${API_BASE}/api/partners/me/upload`;
      const token = localStorage.getItem(STORAGE_KEYS.token);
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        headers["X-Partner-Token"] = token;
      }
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error((data && (data.detail || data.message)) || `Upload failed (${response.status})`);
      }
      return data;
    },

    async uploadPartnerAvatar(file) {
      const url = `${API_BASE}/api/partners/me/avatar`;
      const token = localStorage.getItem(STORAGE_KEYS.token);
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        headers["X-Partner-Token"] = token;
      }
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error((data && (data.detail || data.message)) || "Avatar upload failed");
      }
      if (data && data.partner) {
        localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(data.partner));
      }
      return data;
    },

    async deletePortfolioItem(itemId) {
      return await request(`/api/partners/me/portfolio/${itemId}`, {
        method: "DELETE"
      });
    },

    // ---------------------------------------------
    // PUBLIC PARTNERS DIRECTORY
    // ---------------------------------------------
    async getPublicPartners(options = {}) {
      const query = new URLSearchParams();
      if (options.group) query.set("group", options.group);
      if (options.category) query.set("category", options.category);
      if (options.status) query.set("status_filter", options.status);

      const qs = query.toString() ? `?${query.toString()}` : "";
      try {
        const partners = await request(`/api/partners${qs}`);
        if (Array.isArray(partners) && partners.length > 0) {
          partners.forEach((p) => {
            if (!p.profileImage && p.profile_image) {
              p.profileImage = p.profile_image;
            }
          });
          localStorage.setItem(STORAGE_KEYS.partnersCache, JSON.stringify(partners));
        }
        return partners;
      } catch (err) {
        console.warn("[SweepSage API] Falling back to cached partners:", err.message);
        const cached = localStorage.getItem(STORAGE_KEYS.partnersCache);
        if (cached) {
          try {
            const list = JSON.parse(cached);
            if (Array.isArray(list)) {
              list.forEach((p) => {
                if (!p.profileImage && p.profile_image) {
                  p.profileImage = p.profile_image;
                }
              });
              return list;
            }
          } catch (_e) {}
        }
        return [];
      }
    },

    async getPublicPartnerBySlug(slug) {
      return await request(`/api/partners/${encodeURIComponent(slug)}`);
    },

    // ---------------------------------------------
    // ADMIN OVERVIEW
    // ---------------------------------------------
    async getAdminOverview() {
      return await request("/api/admin/overview");
    },

    async updatePartnerApproval(id, status) {
      return await request(`/api/admin/partners/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
    },

    async updatePortfolioApproval(id, status) {
      return await request(`/api/admin/portfolio/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
    }
  };

  window.SweepSageAPI = SweepSageAPI;
})();
