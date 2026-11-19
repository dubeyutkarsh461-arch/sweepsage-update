/**
 * SWEEPSAGE CATALOG & CONTENT ENGINE (catalog.js)
 * Local-first content management for:
 * 1. Photography: Services, dynamic pricing, and custom packages
 * 2. Salon at Home: "Coming Soon" status, waitlist leads, and teaser configuration
 * 3. Travel: Destinations, packages, and full day-by-day itineraries
 */

(function () {
  const STORAGE_KEY = "sweepsage_catalog_v2";
  const WAITLIST_KEY = "sweepsage_salon_waitlist";
  const CRM_EMAILS_KEY = "sweepsage_crm_emails";
  const CRM_INVOICES_KEY = "sweepsage_crm_invoices";
  const CRM_SESSION_KEY = "sweepsage_crm_session";

  const DEFAULT_CRM_EMAILS = [
    "dubeyutkarsh461@gmail.com"
  ];

  const DEFAULT_CRM_INVOICES = [];

  const DEFAULT_PHOTOGRAPHY_SERVICES = [
    {
      id: "instant",
      name: "10-Min Quick Shoot",
      price: "₹1,499/-",
      basePriceNum: 1499,
      icon: "⚡",
      tag: "MAIN USP",
      description: "Book in minutes: Professional photographer at your doorstep for portraits and special moments.",
      active: true
    },
    {
      id: "wedding",
      name: "Weddings",
      price: "Starting ₹60,000/-",
      basePriceNum: 60000,
      icon: "💍",
      tag: "CINEMATIC",
      description: "Complete wedding photography and cinematic storytelling for every sacred ceremony.",
      active: true
    },
    {
      id: "prewedding",
      name: "Pre-Wedding",
      price: "Starting ₹18,000/-",
      basePriceNum: 18000,
      icon: "❤️",
      tag: "CREATIVE",
      description: "Couple portraits, romantic concepts, and scenic outdoor location shoots.",
      active: true
    },
    {
      id: "engagement",
      name: "Engagement / Roka",
      price: "Starting ₹15,000/-",
      basePriceNum: 15000,
      icon: "💎",
      tag: "CEREMONY",
      description: "Photography for engagement, roka and ring ceremonies with candids.",
      active: true
    },
    {
      id: "birthday",
      name: "Birthday & Milestone",
      price: "Starting ₹4,999/-",
      basePriceNum: 4999,
      icon: "🎂",
      tag: "PARTY",
      description: "Birthday parties, kids celebrations, and milestone anniversaries.",
      active: true
    },
    {
      id: "corporate",
      name: "Corporate & Events",
      price: "Starting ₹9,999/-",
      basePriceNum: 9999,
      icon: "🏢",
      tag: "BUSINESS",
      description: "Conferences, office launches, and high-impact executive team headshots.",
      active: true
    },
    {
      id: "commercial",
      name: "Product & Commercial",
      price: "Starting ₹7,499/-",
      basePriceNum: 7499,
      icon: "📦",
      tag: "E-COMMERCE",
      description: "Product photography, brand lookbooks, food, and social media campaigns.",
      active: true
    },
    {
      id: "portrait",
      name: "Portraits & Personal",
      price: "Starting ₹2,499/-",
      basePriceNum: 2499,
      icon: "📸",
      tag: "STUDIO",
      description: "Executive portraits, maternity, couples, and personal branding shoots.",
      active: true
    }
  ];

  const DEFAULT_PHOTOGRAPHY_PACKAGES = {
    instant: [
      {
        id: "pkg_inst_1",
        serviceId: "instant",
        name: "10-Min Doorstep Shoot",
        price: "₹1,499/-",
        tag: "SWEEPSAGE USP",
        description: "Fast professional photography for quick moments at your doorstep.",
        features: [
          "10-minute professional shoot",
          "1 verified professional creator",
          "Portrait / couple / product / birthday",
          "Digital delivery within 24 hours",
          "10 color-graded high-res frames"
        ]
      },
      {
        id: "pkg_inst_2",
        serviceId: "instant",
        name: "30-Min Extended Portrait",
        price: "₹2,999/-",
        tag: "BEST VALUE",
        description: "Extended session for outfit change and diverse angles.",
        features: [
          "30-minute doorstep session",
          "25 color-graded high-res photos",
          "Portable lighting gear included",
          "Priority 12-hour turnaround"
        ]
      }
    ],
    wedding: [
      {
        id: "pkg_wed_1",
        serviceId: "wedding",
        name: "Essential Wedding",
        price: "₹60,000/-",
        tag: "STARTER",
        description: "Budget-friendly wedding coverage for smaller functions.",
        features: [
          "Traditional Photos & Traditional Videos",
          "E-Invitation Card",
          "1 main function coverage",
          "25 sheets Album (12x36)",
          "1 Traditional Highlight Video",
          "Couple Photo Frame"
        ]
      },
      {
        id: "pkg_wed_2",
        serviceId: "wedding",
        name: "Signature Wedding",
        price: "₹85,000/-",
        tag: "MOST POPULAR",
        description: "Balanced wedding coverage for couples wanting complete candid storytelling.",
        features: [
          "Candid Photographer + Traditional Team",
          "Teaser Video + Full Traditional Video",
          "35 sheets Premium Leatherette Album",
          "Drone Aerial Coverage included",
          "Same-day preview highlights"
        ]
      },
      {
        id: "pkg_wed_3",
        serviceId: "wedding",
        name: "Royal Cinema Production",
        price: "₹1,40,000/-",
        tag: "LUXURY",
        description: "Full multi-day luxury wedding production with cinematic 4K video.",
        features: [
          "2 Candid + 2 Traditional + 1 Drone Master",
          "Pre-wedding shoot included",
          "Cinematic 4K Wedding Film (3-5 mins)",
          "Full 60-90 min documentary edit",
          "2 Ultra-HD Velvet Albums + Parent Minis"
        ]
      }
    ],
    prewedding: [
      {
        id: "pkg_pre_1",
        serviceId: "prewedding",
        name: "Classic Pre-Wedding",
        price: "₹18,000/-",
        tag: "STARTER",
        description: "1-day local outdoor location shoot with stylized frames.",
        features: [
          "1 Pro Candid Photographer",
          "20 retouched high-res photos",
          "3 outfit changes allowed",
          "Props and location guidance"
        ]
      },
      {
        id: "pkg_pre_2",
        serviceId: "prewedding",
        name: "Cinematic Pre-Wedding Film",
        price: "₹35,000/-",
        tag: "POPULAR",
        description: "Photo + 4K Cinema video for your romantic love story.",
        features: [
          "1 Photographer + 1 Cinematographer",
          "2-minute cinematic music video",
          "Drone scenic landscapes",
          "40 edited high-res images"
        ]
      }
    ],
    engagement: [
      {
        id: "pkg_eng_1",
        serviceId: "engagement",
        name: "Roka & Ring Ceremony",
        price: "₹15,000/-",
        tag: "STANDARD",
        description: "Complete ceremony photo coverage with family portraits.",
        features: [
          "1 Candid + 1 Traditional Photographer",
          "Ring ceremony & rituals capture",
          "High-res gallery within 48 hours",
          "50 edited photos"
        ]
      }
    ],
    birthday: [
      {
        id: "pkg_bday_1",
        serviceId: "birthday",
        name: "Birthday Party Special",
        price: "₹4,999/-",
        tag: "POPULAR",
        description: "2 hours coverage for birthday celebration and cake cutting.",
        features: [
          "1 Professional Event Photographer",
          "2 hours of party coverage",
          "All RAW images delivered",
          "30 edited photos included"
        ]
      }
    ],
    corporate: [
      {
        id: "pkg_corp_1",
        serviceId: "corporate",
        name: "Corporate Headshots & Team",
        price: "₹9,999/-",
        tag: "BUSINESS",
        description: "High-impact headshots and office ambiance shoot.",
        features: [
          "Mobile studio flash setup at your office",
          "Up to 10 executive portraits",
          "Skin retouched & LinkedIn formatted",
          "Commercial usage rights"
        ]
      }
    ],
    commercial: [
      {
        id: "pkg_comm_1",
        serviceId: "commercial",
        name: "Product & E-Commerce",
        price: "₹7,499/-",
        tag: "COMMERCIAL",
        description: "Clean white background & lifestyle product photography.",
        features: [
          "Up to 15 product items",
          "Clean cutout & lifestyle framing",
          "Optimized for Amazon/Flipkart/Web",
          "Color accurate retouching"
        ]
      }
    ],
    portrait: [
      {
        id: "pkg_port_1",
        serviceId: "portrait",
        name: "Personal Branding Portrait",
        price: "₹2,499/-",
        tag: "INDIVIDUAL",
        description: "1-hour portrait session for LinkedIn, portfolios, or maternity.",
        features: [
          "1-hour doorstep session",
          "15 retouched portraits",
          "Lighting equipment included",
          "Digital cloud album"
        ]
      }
    ]
  };

  const DEFAULT_SALON_CONFIG = {
    isComingSoon: true,
    badgeText: "COMING SOON",
    headline: "Doorstep Salon & Luxury Beauty",
    subheadline: "We are curating certified top-tier stylists, single-use sterile kits, and luxury vanity stations for your doorstep in Bengaluru & Delhi NCR.",
    launchTimeline: "Launching Early 2027",
    offerTag: "Join the VIP Waitlist for Exclusive 50% Off First Service"
  };

  const DEFAULT_TRAVEL_DESTINATIONS = [
    {
      id: "kashmir",
      name: "Kashmir Paradise",
      tag: "HIMALAYAS",
      duration: "5 Days • 4 Nights",
      price: "₹18,999/- per person",
      numericPrice: 18999,
      imageClass: "d1",
      image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80",
      overview: "Mountains, lakes, slow days, and shikara rides on Dal Lake with snowfall in Gulmarg.",
      itinerary: [
        { day: 1, title: "Arrival in Srinagar & Dal Lake Sunset", desc: "Airport pickup, check-in to luxury houseboat, evening Shikara ride with authentic Kashmiri kahwa." },
        { day: 2, title: "Gulmarg Mountain Excursion", desc: "Gondola cable car ride to Apharwat peak, snow activities, scenic pine forest trails." },
        { day: 3, title: "Pahalgam Valley & Betaab Valley", desc: "Drive through saffron fields, visit Aru Valley, river rafting & riverside evening strolls." },
        { day: 4, title: "Srinagar Heritage & Mughal Gardens", desc: "Explore Nishat & Shalimar Bagh, Pari Mahal, and artisan Kashmiri handicraft shopping." },
        { day: 5, title: "Departure with Memories", desc: "Traditional Kashmiri breakfast, souvenir packing, and airport drop." }
      ],
      inclusions: ["Houseboat Stay in Srinagar", "Private Heated SUV Transfer", "Breakfast & Dinner Daily", "Gulmarg Gondola Guidance", "Dal Lake Shikara Ride"]
    },
    {
      id: "maldives",
      name: "Maldives Tropical Escape",
      tag: "ISLAND ESCAPE",
      duration: "4 Days • 3 Nights",
      price: "₹54,999/- per person",
      numericPrice: 54999,
      imageClass: "d2",
      image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
      overview: "Luxury overwater villas, crystal turquoise lagoons, coral reef snorkeling, and romantic sunset cruises.",
      itinerary: [
        { day: 1, title: "Speedboat Arrival & Overwater Villa Check-in", desc: "Welcome drink, transfer to luxury private island resort, relax on the sun deck." },
        { day: 2, title: "Coral Reef Snorkeling & Water Sports", desc: "Guided snorkeling among marine turtles and vibrant corals; jet-skiing and paddle boarding." },
        { day: 3, title: "Dolphin Watching Sunset Cruise", desc: "Sail into the Indian Ocean sunset with wild dolphin pods; candlelit beach dinner." },
        { day: 4, title: "Island Spa & Departure", desc: "Relaxing spa treatment, infinity pool swim, speedboat transfer to Male airport." }
      ],
      inclusions: ["Luxury Overwater Villa", "All-inclusive Meal Plan", "Round-trip Speedboat Transfers", "Snorkeling Equipment", "Sunset Cruise Experience"]
    },
    {
      id: "singapore",
      name: "Singapore Futuristic City",
      tag: "ASIA",
      duration: "5 Days • 4 Nights",
      price: "₹39,999/- per person",
      numericPrice: 39999,
      imageClass: "d3",
      image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
      overview: "Marina Bay architecture, Universal Studios thrills, Michelin street food, and Gardens by the Bay.",
      itinerary: [
        { day: 1, title: "Arrival & Marina Bay Sands Light Show", desc: "Check into hotel, walk through Helix Bridge, evening Spectra water and light show." },
        { day: 2, title: "Gardens by the Bay & Cloud Forest", desc: "Supertrees walk, flower dome, high-tech indoor waterfall and Chinatown culinary crawl." },
        { day: 3, title: "Sentosa Island & Universal Studios", desc: "Full-day pass to Universal Studios, cable car ride, evening beach club chill." },
        { day: 4, title: "Little India, Orchard Road & Night Safari", desc: "Artisan shopping, luxury fashion avenues, and world-famous nocturnal wildlife safari." },
        { day: 5, title: "Jewel Changi Rain Vortex & Flight Home", desc: "Explore Jewel indoor rainforest and world's tallest indoor waterfall before flight." }
      ],
      inclusions: ["4-Star City Hotel Stay", "Airport & Universal Transfers", "Universal Studios Day Pass", "Gardens by the Bay Double Dome Ticket", "Daily Breakfast"]
    },
    {
      id: "paris",
      name: "Paris Romantic Heritage",
      tag: "EUROPE",
      duration: "6 Days • 5 Nights",
      price: "₹89,999/- per person",
      numericPrice: 89999,
      imageClass: "d4",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
      overview: "Art, haute couture, café culture, Seine river cruises, and illuminated Eiffel Tower.",
      itinerary: [
        { day: 1, title: "Bienvenue à Paris & Seine River Cruise", desc: "Check-in at boutique Parisian hotel, evening illuminated Seine cruise." },
        { day: 2, title: "Eiffel Tower Summit & Champs-Élysées", desc: "Priority summit access at Eiffel Tower, stroll through Arc de Triomphe and luxury boutiques." },
        { day: 3, title: "Louvre Museum & Montmartre Artists", desc: "See the Mona Lisa, walk cobblestone streets of Montmartre up to Sacré-Cœur basilica." },
        { day: 4, title: "Day Trip to Palace of Versailles", desc: "Hall of Mirrors, Royal Grand Apartments, and grand landscaped palace gardens." },
        { day: 5, title: "Le Marais Cafés, Macarons & Vintage Fashion", desc: "Gourmet pastry tasting, bohemian art galleries, and dinner at a Michelin bistrot." },
        { day: 6, title: "Au Revoir Paris", desc: "Croissant breakfast, souvenir shopping, and private transfer to CDG airport." }
      ],
      inclusions: ["Centrally Located Boutique Hotel", "Eiffel Tower Summit Access Ticket", "Louvre Guided Fast-Track Ticket", "Versailles Palace Day Tour", "Seine Dinner Cruise"]
    }
  ];

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("SweepSage Catalog: Failed to load from localStorage", e);
    }
    return {
      photographyServices: DEFAULT_PHOTOGRAPHY_SERVICES,
      photographyPackages: DEFAULT_PHOTOGRAPHY_PACKAGES,
      salonConfig: DEFAULT_SALON_CONFIG,
      travelDestinations: DEFAULT_TRAVEL_DESTINATIONS
    };
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new CustomEvent("sweepsage_catalog_updated", { detail: state }));
    } catch (e) {
      console.error("SweepSage Catalog: Failed to save to localStorage", e);
    }
  }

  const SweepSageCatalog = {
    // ---------------- PHOTOGRAPHY ----------------
    getPhotographyServices: function () {
      const state = loadState();
      return state.photographyServices || DEFAULT_PHOTOGRAPHY_SERVICES;
    },

    savePhotographyServices: function (services) {
      const state = loadState();
      state.photographyServices = services;
      saveState(state);
      return services;
    },

    updatePhotographyServicePrice: function (serviceId, newPrice) {
      const state = loadState();
      const services = state.photographyServices || DEFAULT_PHOTOGRAPHY_SERVICES;
      const target = services.find(s => s.id === serviceId);
      if (target) {
        target.price = newPrice;
        const num = parseInt(newPrice.replace(/[^0-9]/g, ''));
        if (!isNaN(num)) target.basePriceNum = num;
      }
      // Also update packages if instant shoot
      if (serviceId === "instant" && state.photographyPackages && state.photographyPackages.instant && state.photographyPackages.instant[0]) {
        state.photographyPackages.instant[0].price = newPrice;
      }
      state.photographyServices = services;
      saveState(state);
      return target;
    },

    togglePhotographyService: function (serviceId, active) {
      const state = loadState();
      const services = state.photographyServices || DEFAULT_PHOTOGRAPHY_SERVICES;
      const target = services.find(s => s.id === serviceId);
      if (target) {
        target.active = active;
        state.photographyServices = services;
        saveState(state);
      }
      return target;
    },

    getPhotographyPackages: function (serviceId) {
      const state = loadState();
      const pkgs = state.photographyPackages || DEFAULT_PHOTOGRAPHY_PACKAGES;
      if (serviceId) {
        return pkgs[serviceId] || [];
      }
      return pkgs;
    },

    savePhotographyPackage: function (pkg) {
      const state = loadState();
      if (!state.photographyPackages) state.photographyPackages = { ...DEFAULT_PHOTOGRAPHY_PACKAGES };
      const sId = pkg.serviceId || "instant";
      if (!state.photographyPackages[sId]) {
        state.photographyPackages[sId] = [];
      }
      
      const existingIdx = state.photographyPackages[sId].findIndex(p => p.id === pkg.id);
      if (existingIdx >= 0) {
        state.photographyPackages[sId][existingIdx] = { ...state.photographyPackages[sId][existingIdx], ...pkg };
      } else {
        if (!pkg.id) pkg.id = "pkg_" + Date.now();
        state.photographyPackages[sId].push(pkg);
      }
      saveState(state);
      return pkg;
    },

    deletePhotographyPackage: function (serviceId, pkgId) {
      const state = loadState();
      if (state.photographyPackages && state.photographyPackages[serviceId]) {
        state.photographyPackages[serviceId] = state.photographyPackages[serviceId].filter(p => p.id !== pkgId);
        saveState(state);
        return true;
      }
      return false;
    },

    // ---------------- SALON ----------------
    getSalonConfig: function () {
      const state = loadState();
      return state.salonConfig || DEFAULT_SALON_CONFIG;
    },

    saveSalonConfig: function (config) {
      const state = loadState();
      state.salonConfig = { ...(state.salonConfig || DEFAULT_SALON_CONFIG), ...config };
      saveState(state);
      return state.salonConfig;
    },

    getSalonWaitlist: function () {
      try {
        const raw = localStorage.getItem(WAITLIST_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn("Failed to load salon waitlist", e);
      }
      return [
        {
          id: "W-101",
          name: "Rhea Singhania",
          phone: "+91 98201 44521",
          serviceInterest: "Bridal & HD Glam Makeup",
          city: "Bengaluru (Indiranagar)",
          date: "2026-11-18",
          status: "VIP Early Access"
        },
        {
          id: "W-102",
          name: "Tanvi Mathur",
          phone: "+91 98711 00293",
          serviceInterest: "Organic Facial & Hair Spa",
          city: "Delhi NCR (South Ex)",
          date: "2026-11-19",
          status: "50% Off Claimed"
        }
      ];
    },

    addSalonWaitlist: function (entry) {
      const list = this.getSalonWaitlist();
      const newEntry = {
        id: "W-" + Math.floor(100 + Math.random() * 900),
        name: entry.name || "Anonymous Guest",
        phone: entry.phone || "",
        serviceInterest: entry.serviceInterest || "General Salon at Home",
        city: entry.city || "Bengaluru / Delhi NCR",
        date: new Date().toISOString().split('T')[0],
        status: "50% Off Claimed",
        ...entry
      };
      list.unshift(newEntry);
      try {
        localStorage.setItem(WAITLIST_KEY, JSON.stringify(list));
      } catch (e) {
        console.warn("Failed to save salon waitlist", e);
      }
      return newEntry;
    },

    // ---------------- TRAVEL ----------------
    getTravelDestinations: function () {
      const state = loadState();
      return state.travelDestinations || DEFAULT_TRAVEL_DESTINATIONS;
    },

    saveTravelDestination: function (dest) {
      const state = loadState();
      if (!state.travelDestinations) state.travelDestinations = [...DEFAULT_TRAVEL_DESTINATIONS];
      
      const existingIdx = state.travelDestinations.findIndex(d => d.id === dest.id);
      if (existingIdx >= 0) {
        state.travelDestinations[existingIdx] = { ...state.travelDestinations[existingIdx], ...dest };
      } else {
        if (!dest.id) {
          dest.id = dest.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        }
        state.travelDestinations.push(dest);
      }
      saveState(state);
      return dest;
    },

    deleteTravelDestination: function (destId) {
      const state = loadState();
      if (state.travelDestinations) {
        state.travelDestinations = state.travelDestinations.filter(d => d.id !== destId);
        saveState(state);
        return true;
      }
      return false;
    },

    // ---------------- TRAVEL CRM & INVOICING ----------------
    getRegisteredCRMEmails: function () {
      try {
        const stored = localStorage.getItem(CRM_EMAILS_KEY);
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            // Strip any mock seed emails
            const realEmails = list.filter(e => !["admin@sweepsage.com", "concierge@sweepsage.com", "travel@sweepsage.com", "founder@sweepsage.com"].includes(e.toLowerCase()));
            if (!realEmails.includes("dubeyutkarsh461@gmail.com")) realEmails.push("dubeyutkarsh461@gmail.com");
            return realEmails;
          }
        }
      } catch (e) {}
      return [...DEFAULT_CRM_EMAILS];
    },

    isEmailRegistered: function (email) {
      if (!email) return false;
      const clean = email.trim().toLowerCase();
      const list = this.getRegisteredCRMEmails();
      return list.some(e => e.toLowerCase() === clean);
    },

    addRegisteredCRMEmail: function (email) {
      if (!email) return false;
      const clean = email.trim().toLowerCase();
      const list = this.getRegisteredCRMEmails();
      if (!list.includes(clean)) {
        list.push(clean);
        localStorage.setItem(CRM_EMAILS_KEY, JSON.stringify(list));
      }
      return true;
    },

    removeRegisteredCRMEmail: function (email) {
      const clean = email.trim().toLowerCase();
      let list = this.getRegisteredCRMEmails();
      list = list.filter(e => e.toLowerCase() !== clean);
      localStorage.setItem(CRM_EMAILS_KEY, JSON.stringify(list));
      return list;
    },

    getCurrentCRMUser: function () {
      const session = localStorage.getItem(CRM_SESSION_KEY);
      if (session === "logged_out") return null;
      return session || DEFAULT_CRM_EMAILS[0];
    },

    setCRMUser: function (email) {
      const clean = email.trim().toLowerCase();
      localStorage.setItem(CRM_SESSION_KEY, clean);
      return clean;
    },

    logoutCRMUser: function () {
      localStorage.setItem(CRM_SESSION_KEY, "logged_out");
    },

    getCRMInvoices: function () {
      try {
        const stored = localStorage.getItem(CRM_INVOICES_KEY);
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            // Remove any mock demo invoices not created by user
            const realList = list.filter(i => 
              i.id !== "INV-SWP-8821" && 
              i.id !== "INV-SWP-7412" && 
              i.clientName !== "Dr. Vikramaditya Roy" && 
              i.clientName !== "Priya & Siddharth Sharma"
            );
            if (realList.length !== list.length) {
              localStorage.setItem(CRM_INVOICES_KEY, JSON.stringify(realList));
            }
            return realList;
          }
        }
      } catch (e) {}
      return [];
    },

    saveCRMInvoice: function (invoice) {
      const list = this.getCRMInvoices();
      if (!invoice.id) {
        const rand = Math.floor(1000 + Math.random() * 9000);
        invoice.id = `INV-SWP-${rand}`;
      }
      const existingIdx = list.findIndex(i => i.id === invoice.id);
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...invoice, updatedDate: new Date().toISOString() };
      } else {
        list.unshift({ ...invoice, createdDate: new Date().toISOString().split('T')[0] });
      }
      try {
        localStorage.setItem(CRM_INVOICES_KEY, JSON.stringify(list));
      } catch (e) {
        console.warn("Failed to save CRM invoice", e);
      }
      return invoice;
    },

    deleteCRMInvoice: function (invoiceId) {
      let list = this.getCRMInvoices();
      list = list.filter(i => i.id !== invoiceId);
      try {
        localStorage.setItem(CRM_INVOICES_KEY, JSON.stringify(list));
        return true;
      } catch (e) {
        return false;
      }
    },

    resetToDefaults: function () {
      localStorage.removeItem(STORAGE_KEY);
      const state = loadState();
      saveState(state);
      return state;
    }
  };

  // Expose globally
  window.SweepSageCatalog = SweepSageCatalog;
})();
