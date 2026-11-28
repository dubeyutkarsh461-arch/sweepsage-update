/**
 * SWEEPSAGE CATALOG & CONTENT ENGINE (catalog.js)
 * Local-first content management for:
 * 1. Photography: Services, dynamic pricing, and custom packages
 * 2. Salon at Home: "Coming Soon" status, waitlist leads, and teaser configuration
 * 3. Travel: Destinations, packages, and full day-by-day itineraries
 */

(function () {
  const STORAGE_KEY = "sweepsage_catalog_v3";
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
      name: "Instant Photographer",
      price: "Starting ₹1,499/-",
      basePriceNum: 1499,
      icon: "⚡",
      tag: "MAIN USP",
      description: "Instant photographer at your doorstep: 1 Hour (₹1,499/-), 4 Hours (₹3,599/-), or 10 Hours (₹9,999/-).",
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
        name: "Instant Shoot (1 Hour)",
        price: "₹1,499/-",
        tag: "1 HOUR • POPULAR",
        image: "pkg_instant_shoot.jpg",
        description: "1 hour dedicated professional photography session for portraits, couples, birthdays or special moments at your doorstep.",
        features: [
          "1 Hour dedicated professional shoot",
          "1 Verified professional creator",
          "Portraits, couples, birthdays & occasions",
          "Digital delivery within 24 hours",
          "High-res color-graded frames"
        ]
      },
      {
        id: "pkg_inst_2",
        serviceId: "instant",
        name: "Instant Shoot (4 Hours)",
        price: "₹3,599/-",
        tag: "4 HOURS • BEST VALUE",
        image: "pkg_inst_4hr.jpg",
        description: "4 hours continuous half-day coverage for parties, ceremonies, family gatherings and corporate events.",
        features: [
          "4 Hours continuous professional coverage",
          "Senior verified photographer with pro lighting",
          "Parties, family gatherings & ceremonies",
          "All color-graded high-res photos",
          "Priority 24-hour digital delivery"
        ]
      },
      {
        id: "pkg_inst_3",
        serviceId: "instant",
        name: "Instant Shoot (10 Hours)",
        price: "₹9,999/-",
        tag: "10 HOURS • FULL DAY PRO",
        image: "pkg_inst_10hr.jpg",
        description: "10 hours comprehensive full-day coverage for full-scale events, day-long functions, weddings and productions.",
        features: [
          "10 Hours full-day comprehensive coverage",
          "Lead verified photographer + studio lighting",
          "Unlimited captures & full color-graded gallery",
          "Dedicated concierge & expedited delivery",
          "Full commercial usage rights"
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
        image: "pkg_wedding_celebration.jpg",
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
        image: "pkg_wedding_varmala.jpg",
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
        image: "pkg_bridal_portrait.jpg",
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
        image: "pkg_couples_portraits.jpg",
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
        image: "pkg_prewed_sunset.jpg",
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
        image: "pkg_engagement_ring.jpg",
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
        image: "pkg_birthday_cake.jpg",
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
        image: "pkg_corporate_headshot.jpg",
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
        image: "pkg_product_ecommerce.jpg",
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
        image: "pkg_maternity_portrait.jpg",
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
      image: "travel_kashmir_shikara.jpg",
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

  // Real-time cross-tab synchronization channel
  let syncChannel = null;
  try {
    if (typeof window !== "undefined" && window.BroadcastChannel) {
      syncChannel = new BroadcastChannel("sweepsage_realtime_sync");
      syncChannel.onmessage = function (e) {
        if (e && e.data && e.data.type === "SWEEPSAGE_CATALOG_SYNC") {
          try {
            window.dispatchEvent(new CustomEvent("sweepsage_catalog_updated", { detail: e.data.state }));
          } catch (err) { }
        }
      };
    }
  } catch (e) { }

  if (typeof window !== "undefined") {
    window.addEventListener("storage", function (e) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const state = JSON.parse(e.newValue);
          window.dispatchEvent(new CustomEvent("sweepsage_catalog_updated", { detail: state }));
        } catch (err) { }
      }
    });
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const photoPkgs = parsed.photographyPackages || DEFAULT_PHOTOGRAPHY_PACKAGES;
        if (photoPkgs) {
          Object.keys(DEFAULT_PHOTOGRAPHY_PACKAGES).forEach(sKey => {
            if (photoPkgs[sKey]) {
              photoPkgs[sKey].forEach(p => {
                const def = DEFAULT_PHOTOGRAPHY_PACKAGES[sKey]?.find(dp => dp.id === p.id || dp.name === p.name);
                if (def && def.image && (!p.image || p.image.includes('images.unsplash.com') || p.id === def.id)) {
                  p.image = def.image;
                }
              });
            }
          });
        }

        return {
          photographyServices: (parsed.photographyServices && parsed.photographyServices.length > 0) ? parsed.photographyServices : DEFAULT_PHOTOGRAPHY_SERVICES,
          photographyPackages: photoPkgs,
          salonConfig: parsed.salonConfig || DEFAULT_SALON_CONFIG,
          travelDestinations: (parsed.travelDestinations && parsed.travelDestinations.length > 0) ? parsed.travelDestinations : DEFAULT_TRAVEL_DESTINATIONS
        };
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
      if (syncChannel) {
        try {
          syncChannel.postMessage({ type: "SWEEPSAGE_CATALOG_SYNC", state: state });
        } catch (err) { }
      }
    } catch (e) {
      console.error("SweepSage Catalog: Failed to save to localStorage", e);
    }

    // Background sync to backend SQLite / Vercel API
    if (typeof window !== "undefined" && window.fetch) {
      const baseUrl = window.SweepSageAPI ? window.SweepSageAPI.getBaseUrl() : "";
      fetch(baseUrl + '/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      }).catch((e) => { console.warn("[SweepSage Catalog] Sync to backend failed:", e); });
    }

    // Sync to Supabase Cloud Database (Multi-Device Persistent Engine)
    syncCatalogToSupabase(state);
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
      } catch (e) { }
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
      if (typeof window !== "undefined" && window.fetch) {
        const baseUrl = window.SweepSageAPI ? window.SweepSageAPI.getBaseUrl() : "";
        fetch(baseUrl + '/api/crm/coordinators', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: clean, role: 'Coordinator' })
        }).catch(() => { });
      }
      return true;
    },

    removeRegisteredCRMEmail: function (email) {
      const clean = email.trim().toLowerCase();
      let list = this.getRegisteredCRMEmails();
      list = list.filter(e => e.toLowerCase() !== clean);
      localStorage.setItem(CRM_EMAILS_KEY, JSON.stringify(list));
      if (typeof window !== "undefined" && window.fetch) {
        const baseUrl = window.SweepSageAPI ? window.SweepSageAPI.getBaseUrl() : "";
        fetch(baseUrl + '/api/crm/coordinators/' + encodeURIComponent(clean), { method: 'DELETE' }).catch(() => { });
      }
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
      } catch (e) { }
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
        window.dispatchEvent(new CustomEvent("sweepsage_catalog_updated", { detail: { invoices: list } }));
        if (syncChannel) {
          try { syncChannel.postMessage({ type: "SWEEPSAGE_CATALOG_SYNC", detail: { invoices: list } }); } catch (err) { }
        }
      } catch (e) {
        console.warn("Failed to save CRM invoice", e);
      }

      // Save to IndexedDB (SweepSageDB)
      if (indexedDBInstance) {
        try {
          const tx = indexedDBInstance.transaction(["crm_invoices"], "readwrite");
          tx.objectStore("crm_invoices").put(invoice);
        } catch (e) { }
      }

      // Background sync to SQLite Backend (if server active)
      if (typeof window !== "undefined" && window.fetch) {
        const baseUrl = window.SweepSageAPI ? window.SweepSageAPI.getBaseUrl() : "";
        fetch(baseUrl + '/api/crm/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoice)
        }).catch(() => { });
      }

      // Sync to Supabase Cloud Database (Multi-Device Engine)
      syncInvoiceToSupabase(invoice);

      return invoice;
    },

    deleteCRMInvoice: function (invoiceId) {
      let list = this.getCRMInvoices();
      list = list.filter(i => i.id !== invoiceId);
      try {
        localStorage.setItem(CRM_INVOICES_KEY, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent("sweepsage_catalog_updated", { detail: { invoices: list } }));
        if (syncChannel) {
          try { syncChannel.postMessage({ type: "SWEEPSAGE_CATALOG_SYNC", detail: { invoices: list } }); } catch (err) { }
        }
      } catch (e) { }

      // Delete from IndexedDB
      if (indexedDBInstance) {
        try {
          const tx = indexedDBInstance.transaction(["crm_invoices"], "readwrite");
          tx.objectStore("crm_invoices").delete(invoiceId);
        } catch (e) { }
      }

      // Sync delete with SQLite Backend
      if (typeof window !== "undefined" && window.fetch) {
        const baseUrl = window.SweepSageAPI ? window.SweepSageAPI.getBaseUrl() : "";
        fetch(`${baseUrl}/api/crm/invoices/${encodeURIComponent(invoiceId)}`, { method: 'DELETE' }).catch(() => { });
      }

      // Sync delete from Supabase Cloud Database
      deleteInvoiceFromSupabase(invoiceId);

      return true;
    },

    // Database Export & Backup Engine
    exportDatabaseJSON: function () {
      const data = {
        database: "SweepSageDB",
        version: "2.1.0",
        exportedAt: new Date().toISOString(),
        crmInvoices: this.getCRMInvoices(),
        travelDestinations: this.getTravelDestinations(),
        coordinators: this.getRegisteredCRMEmails(),
        photographyServices: this.getPhotographyServices()
      };
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sweepsage_database_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return data;
    },

    // Database Import & Restore Engine
    importDatabaseJSON: function (jsonStr) {
      try {
        const data = typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
        if (data.crmInvoices && Array.isArray(data.crmInvoices)) {
          localStorage.setItem(CRM_INVOICES_KEY, JSON.stringify(data.crmInvoices));
        }
        if (data.travelDestinations && Array.isArray(data.travelDestinations)) {
          const state = loadState();
          state.travelDestinations = data.travelDestinations;
          saveState(state);
        }
        if (data.coordinators && Array.isArray(data.coordinators)) {
          localStorage.setItem(CRM_EMAILS_KEY, JSON.stringify(data.coordinators));
        }
        syncLocalStorageToIndexedDB();
        return { success: true, count: (data.crmInvoices || []).length };
      } catch (e) {
        console.error("Database import error:", e);
        return { success: false, error: e.message };
      }
    },

    getDatabaseStatus: function () {
      return {
        engine: indexedDBInstance ? "IndexedDB + SQLite Sync" : "LocalStorage Persistent Engine",
        indexedDBActive: !!indexedDBInstance,
        dbName: DB_NAME,
        totalInvoices: this.getCRMInvoices().length,
        totalDestinations: this.getTravelDestinations().length
      };
    },

    resetToDefaults: function () {
      localStorage.removeItem(STORAGE_KEY);
      const state = loadState();
      saveState(state);
      return state;
    },
    syncWithServer: function () {
      return syncCatalogWithBackend();
    }
  };

  // =========================================================
  // INDEXEDDB ENGINE INITIALIZATION
  // =========================================================
  const DB_NAME = "SweepSageDB";
  const DB_VERSION = 1;
  let indexedDBInstance = null;

  function initIndexedDB() {
    if (typeof window === "undefined" || !window.indexedDB) return;
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = function (event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("crm_invoices")) {
          const store = db.createObjectStore("crm_invoices", { keyPath: "id" });
          store.createIndex("status", "status", { unique: false });
          store.createIndex("createdDate", "createdDate", { unique: false });
        }
        if (!db.objectStoreNames.contains("travel_destinations")) {
          db.createObjectStore("travel_destinations", { keyPath: "id" });
        }
      };

      request.onsuccess = function (event) {
        indexedDBInstance = event.target.result;
        syncLocalStorageToIndexedDB();
      };

      request.onerror = function (event) {
        console.warn("IndexedDB notice:", event.target.error);
      };
    } catch (e) { }
  }

  function syncLocalStorageToIndexedDB() {
    if (!indexedDBInstance) return;
    try {
      const invoices = SweepSageCatalog.getCRMInvoices();
      if (invoices && invoices.length > 0) {
        const tx = indexedDBInstance.transaction(["crm_invoices"], "readwrite");
        const store = tx.objectStore("crm_invoices");
        invoices.forEach(inv => store.put(inv));
      }
      const dests = SweepSageCatalog.getTravelDestinations();
      if (dests && dests.length > 0) {
        const tx = indexedDBInstance.transaction(["travel_destinations"], "readwrite");
        const store = tx.objectStore("travel_destinations");
        dests.forEach(d => store.put(d));
      }
    } catch (e) { }
  }

  // Initialize DB immediately
  initIndexedDB();

  // Real-time synchronization with FastAPI & SQLite database
  function getCatalogBaseUrl() {
    if (typeof window !== "undefined") {
      if (window.SweepSageAPI && typeof window.SweepSageAPI.getBaseUrl === "function") {
        return window.SweepSageAPI.getBaseUrl();
      }
      if (window.location && window.location.protocol === "file:") {
        return "http://127.0.0.1:8000";
      }
    }
    return "";
  }

  function syncCatalogWithBackend() {
    if (typeof window === "undefined" || !window.fetch) return Promise.resolve(null);
    const baseUrl = getCatalogBaseUrl();
    return fetch(baseUrl + '/api/catalog')
      .then(res => res.ok ? res.json() : null)
      .then(remoteState => {
        if (remoteState && (remoteState.photographyServices || remoteState.travelDestinations)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteState));
          window.dispatchEvent(new CustomEvent("sweepsage_catalog_updated", { detail: remoteState }));
          return remoteState;
        } else {
          // If server database is empty, seed it with the current default state
          const current = loadState();
          fetch(baseUrl + '/api/catalog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(current)
          }).catch(() => { });
          return current;
        }
      })
      .catch((err) => {
        console.warn("[SweepSage Catalog] Server catalog sync notice:", err);
        return null;
      });
  }

  // Attempt sync immediately on load
  syncCatalogWithBackend();

  // =========================================================
  // SUPABASE CLOUD DATABASE SYNC ENGINE (REALTIME MULTI-DEVICE)
  // =========================================================
  let supabaseClient = null;

  function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    const cfg = window.SweepSageSupabaseConfig;
    if (cfg && cfg.enabled && cfg.url && cfg.anonKey && cfg.url !== 'https://your-project-ref.supabase.co' && window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        supabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey);
        return supabaseClient;
      } catch (err) {
        console.warn("SweepSage: Supabase init error:", err);
      }
    }
    return null;
  }

  async function syncCatalogToSupabase(state) {
    const sb = getSupabaseClient();
    if (!sb) return;
    try {
      await sb.from("site_catalog").upsert({
        id: "main_catalog",
        catalog_json: JSON.stringify(state),
        updated_at: new Date().toISOString()
      });
      console.log("☁️ Supabase: Catalog synced to cloud successfully!");
    } catch (err) {
      console.warn("Supabase catalog save notice:", err);
    }
  }

  async function syncInvoiceToSupabase(inv) {
    const sb = getSupabaseClient();
    if (!sb) return;
    try {
      await sb.from("crm_invoices").upsert({
        id: inv.id,
        data: inv,
        updated_at: new Date().toISOString()
      });
      console.log("☁️ Supabase: Invoice saved to cloud:", inv.id);
    } catch (err) {
      console.warn("Supabase invoice save notice:", err);
    }
  }

  async function deleteInvoiceFromSupabase(invId) {
    const sb = getSupabaseClient();
    if (!sb) return;
    try {
      await sb.from("crm_invoices").delete().eq("id", invId);
      console.log("☁️ Supabase: Invoice deleted from cloud:", invId);
    } catch (err) {
      console.warn("Supabase invoice delete notice:", err);
    }
  }

  async function initCloudSupabaseSync() {
    const sb = getSupabaseClient();
    if (!sb) return;
    try {
      // 1. Fetch site catalog from cloud
      const { data: catRow } = await sb.from("site_catalog").select("catalog_json").eq("id", "main_catalog").maybeSingle();
      if (catRow && catRow.catalog_json) {
        try {
          const cloudState = JSON.parse(catRow.catalog_json);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudState));
          window.dispatchEvent(new CustomEvent("sweepsage_catalog_updated", { detail: cloudState }));
        } catch (e) { }
      } else {
        // If empty in cloud, seed current default state to Supabase
        const cur = loadState();
        await syncCatalogToSupabase(cur);
      }

      // 2. Fetch CRM invoices from cloud
      const { data: invRows } = await sb.from("crm_invoices").select("data");
      if (invRows && Array.isArray(invRows) && invRows.length > 0) {
        const cloudInvoices = invRows.map(r => r.data).filter(Boolean);
        localStorage.setItem(CRM_INVOICES_KEY, JSON.stringify(cloudInvoices));
        window.dispatchEvent(new CustomEvent("sweepsage_catalog_updated", { detail: { invoices: cloudInvoices } }));
      }

      // 3. Setup Supabase Realtime across all open devices (mobile, laptop, client screens)
      sb.channel("sweepsage_global_realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "site_catalog" }, payload => {
          if (payload.new && payload.new.catalog_json) {
            try {
              const updated = JSON.parse(payload.new.catalog_json);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              window.dispatchEvent(new CustomEvent("sweepsage_catalog_updated", { detail: updated }));
            } catch (err) { }
          }
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "crm_invoices" }, async () => {
          const { data: refreshed } = await sb.from("crm_invoices").select("data");
          if (refreshed) {
            const list = refreshed.map(r => r.data).filter(Boolean);
            localStorage.setItem(CRM_INVOICES_KEY, JSON.stringify(list));
            window.dispatchEvent(new CustomEvent("sweepsage_catalog_updated", { detail: { invoices: list } }));
          }
        })
        .subscribe();
      console.log("⚡ Supabase Realtime active! Instant sync across all devices connected.");
    } catch (err) {
      console.warn("Supabase initCloudSupabaseSync notice:", err);
    }
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initCloudSupabaseSync);
    } else {
      initCloudSupabaseSync();
    }
  }

  function updateGlobalNavPrice() {
    try {
      const services = SweepSageCatalog.getPhotographyServices();
      const inst = services.find(s => s.id === 'instant');
      if (inst && inst.price) {
        document.querySelectorAll('#navMoreInstantPrice, .nav-more-badge').forEach(el => {
          el.textContent = inst.price;
        });
      }
    } catch (e) { }
  }

  if (typeof window !== "undefined") {
    window.addEventListener('sweepsage_catalog_updated', updateGlobalNavPrice);
    if (typeof document !== "undefined") {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", updateGlobalNavPrice);
      } else {
        updateGlobalNavPrice();
      }
    }
  }

  // Expose globally
  window.SweepSageCatalog = SweepSageCatalog;
  window.SweepSageDB = SweepSageCatalog;
})();
