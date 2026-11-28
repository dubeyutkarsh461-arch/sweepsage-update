

/* =========================================================
   SWEEPSAGE BOOKING JAVASCRIPT
========================================================= */

let currentStep = 2;

let booking = {

    service:"",
    event:"",
    eventName:"",
    package:"",
    price:"",
    details:{}

};


/* =========================================================
   EVENT DATA
========================================================= */

const events = {

    photographer:[

        {
            id:"instant",
            icon:"⚡",
            name:"Instant Photographer",
            description:"On-demand photographer at your doorstep: 1 Hr (₹1,499/-), 4 Hrs (₹3,599/-), or 10 Hrs (₹9,999/-)."
        },

        {
            id:"wedding",
            icon:"💍",
            name:"Wedding",
            description:"Complete wedding photography and cinematography."
        },

        {
            id:"prewedding",
            icon:"❤️",
            name:"Pre-Wedding",
            description:"Couple portraits, cinematic stories and location shoots."
        },

        {
            id:"engagement",
            icon:"💎",
            name:"Engagement / Roka",
            description:"Photography for engagement, roka and ring ceremonies."
        },

        {
            id:"birthday",
            icon:"🎂",
            name:"Birthday",
            description:"Birthday parties, kids parties and milestone celebrations."
        },

        {
            id:"party",
            icon:"🎉",
            name:"Party / Event",
            description:"Professional coverage for parties and private events."
        },

        {
            id:"corporate",
            icon:"🏢",
            name:"Corporate",
            description:"Corporate events, conferences, launches and office functions."
        },

        {
            id:"commercial",
            icon:"📦",
            name:"Product / Commercial",
            description:"Product photography, business content and brand shoots."
        },

        {
            id:"portrait",
            icon:"📸",
            name:"Portrait & Personal",
            description:"Portraits, couple shoots, maternity and personal branding sessions."
        },

        {
            id:"custom",
            icon:"✨",
            name:"Custom Requirement",
            description:"Something different? Tell us exactly what you need."
        }

    ],


    salon:[

        {
            id:"bridal",
            icon:"👰",
            name:"Bridal",
            description:"Complete bridal makeup, hair, draping and beauty preparation."
        },

        {
            id:"engagement",
            icon:"💍",
            name:"Engagement / Roka",
            description:"Elegant makeup and styling for your special function."
        },

        {
            id:"reception",
            icon:"✨",
            name:"Reception",
            description:"Glamorous reception-ready makeup and hair styling."
        },

        {
            id:"party",
            icon:"🎉",
            name:"Party / Function",
            description:"Professional party makeup and styling at home."
        },

        {
            id:"photoshoot",
            icon:"📸",
            name:"Photoshoot Makeup",
            description:"Camera-ready makeup for shoots and content creation."
        },

        {
            id:"prebridal",
            icon:"🌸",
            name:"Pre-Bridal",
            description:"Skin, waxing, manicure, pedicure, hair and beauty preparation."
        },

        {
            id:"grooming",
            icon:"🧴",
            name:"Beauty & Grooming",
            description:"Facial, waxing, threading, nails, hair spa and grooming."
        },

        {
            id:"makeup",
            icon:"💄",
            name:"Makeup Only",
            description:"Book professional makeup without a complete package."
        },

        {
            id:"hair",
            icon:"💇",
            name:"Hair Services",
            description:"Hair styling, spa, curls, straightening and occasion styling."
        },

        {
            id:"custom",
            icon:"✨",
            name:"Custom Requirement",
            description:"Tell us the beauty services you want."
        }

    ],


    travel:[

        {
            id:"honeymoon",
            icon:"❤️",
            name:"Honeymoon",
            description:"Romantic trips with stays, sightseeing and experiences."
        },

        {
            id:"family",
            icon:"👨‍👩‍👧‍👦",
            name:"Family Holiday",
            description:"Comfortable trips planned for families and children."
        },

        {
            id:"solo",
            icon:"🎒",
            name:"Solo Trip",
            description:"Flexible trips for independent travellers."
        },

        {
            id:"group",
            icon:"🚌",
            name:"Group Trip",
            description:"Friends, colleges, offices and large groups."
        },

        {
            id:"adventure",
            icon:"🏔️",
            name:"Adventure",
            description:"Trekking, camping, rafting and adventure experiences."
        },

        {
            id:"international",
            icon:"🌍",
            name:"International",
            description:"International holidays planned around your preferences."
        },

        {
            id:"spiritual",
            icon:"🛕",
            name:"Spiritual / Religious",
            description:"Pilgrimage and spiritual journeys."
        },

        {
            id:"roadtrip",
            icon:"🚗",
            name:"Road Trip",
            description:"Self-drive and road-trip itineraries."
        },

        {
            id:"corporate",
            icon:"🏢",
            name:"Corporate Travel",
            description:"Business travel, conferences and corporate groups."
        },

        {
            id:"custom",
            icon:"✨",
            name:"Custom Trip",
            description:"Tell us your destination and we'll build the plan."
        }

    ]

};


/* =========================================================
   PACKAGE DATA
========================================================= */

const packages = {


photographer:{


instant:[

    {
        id:"pkg_inst_1",
        name:"Instant Shoot (1 Hour)",
        price:"₹1,499/-",
        tag:"1 HOUR • POPULAR",
        image:"pkg_instant_shoot.jpg",
        description:"1 hour dedicated professional photography session for portraits, couples, birthdays or special moments at your doorstep.",
        features:[
            "1 Hour dedicated professional shoot",
            "1 Verified professional photographer",
            "Portraits, couples, birthdays & occasions",
            "Digital gallery delivery within 24 hours",
            "High-res color-graded frames"
        ]
    },

    {
        id:"pkg_inst_2",
        name:"Instant Shoot (4 Hours)",
        price:"₹3,599/-",
        tag:"4 HOURS • BEST VALUE",
        image:"pkg_inst_4hr.jpg",
        description:"4 hours continuous half-day coverage for parties, ceremonies, family gatherings and corporate events.",
        features:[
            "4 Hours continuous professional coverage",
            "1 Senior verified photographer with pro lighting",
            "Parties, family gatherings & ceremonies",
            "All color-graded high-res photos",
            "Priority 24-hour digital delivery"
        ]
    },

    {
        id:"pkg_inst_3",
        name:"Instant Shoot (10 Hours)",
        price:"₹9,999/-",
        tag:"10 HOURS • FULL DAY PRO",
        image:"pkg_inst_10hr.jpg",
        description:"10 hours comprehensive full-day coverage for full-scale events, day-long functions, weddings and productions.",
        features:[
            "10 Hours full-day comprehensive coverage",
            "Lead verified photographer + studio lighting",
            "Unlimited captures & full color-graded gallery",
            "Dedicated concierge & expedited delivery",
            "Full commercial usage rights"
        ]
    }

],


wedding:[

    {
        id:"pkg_wed_1",
        name:"Essential Wedding",
        price:"₹60,000/-",
        tag:"STARTER",
        image:"pkg_wedding_celebration.jpg",
        description:"Budget-friendly wedding coverage for smaller functions.",
        features:[
            "Traditional Photos & Traditional Videos",
            "E-Invitation Card",
            "1 main function coverage",
            "25 sheets Album (12x36)",
            "1 Traditional Highlight Video",
            "Couple Photo Frame"
        ]
    },

    {
        id:"pkg_wed_2",
        name:"Signature Wedding",
        price:"₹85,000/-",
        tag:"MOST POPULAR",
        image:"pkg_wedding_varmala.jpg",
        description:"Balanced wedding coverage for couples wanting complete candid storytelling.",
        features:[
            "Candid Photographer + Traditional Team",
            "Teaser Video + Full Traditional Video",
            "35 sheets Premium Leatherette Album",
            "Drone Aerial Coverage included",
            "Same-day preview highlights"
        ]
    },

    {
        id:"pkg_wed_3",
        name:"Royal Cinema Production",
        price:"₹1,40,000/-",
        tag:"LUXURY",
        image:"pkg_bridal_portrait.jpg",
        description:"Full multi-day luxury wedding production with cinematic 4K video.",
        features:[
            "2 Candid + 2 Traditional + 1 Drone Master",
            "Pre-wedding shoot included",
            "Cinematic 4K Wedding Film (3-5 mins)",
            "Full 60-90 min documentary edit",
            "2 Ultra-HD Velvet Albums + Parent Minis"
        ]
    },

    {
        id:"pkg_wed_4",
        name:"Luxury Custom",
        price:"Custom Quote",
        tag:"BESPOKE",
        image:"pkg_wedding_night.jpg",
        description:"For multi-day weddings and larger bespoke production requirements.",
        features:[
            "Multiple photographers & cinematographers",
            "Drone & crane aerials",
            "Cinematic teaser & feature documentary film",
            "Luxury heirloom albums",
            "Dedicated wedding production director"
        ]
    }

],


prewedding:[

    {
        id:"pkg_pre_1",
        name:"Classic Pre-Wedding",
        price:"₹18,000/-",
        tag:"STARTER",
        image:"pkg_couples_portraits.jpg",
        description:"1-day local outdoor location shoot with stylized frames.",
        features:[
            "1 Pro Candid Photographer",
            "20 retouched high-res photos",
            "3 outfit changes allowed",
            "Props and location guidance"
        ]
    },

    {
        id:"pkg_pre_2",
        name:"Cinematic Pre-Wedding Film",
        price:"₹35,000/-",
        tag:"POPULAR",
        image:"pkg_prewed_sunset.jpg",
        description:"Photo + 4K Cinema video for your romantic love story.",
        features:[
            "1 Photographer + 1 Cinematographer",
            "2-minute cinematic music video",
            "Drone scenic landscapes",
            "40 edited high-res images"
        ]
    }

],


engagement:[

    {
        id:"pkg_eng_1",
        name:"Roka & Ring Ceremony",
        price:"₹15,000/-",
        tag:"STANDARD",
        image:"pkg_engagement_ring.jpg",
        description:"Complete ceremony photo coverage with family portraits.",
        features:[
            "1 Candid + 1 Traditional Photographer",
            "Ring ceremony & rituals capture",
            "High-res gallery within 48 hours",
            "50 edited photos"
        ]
    },

    {
        id:"pkg_eng_2",
        name:"Signature Engagement & Sangeet",
        price:"₹35,000/-",
        tag:"POPULAR",
        image:"pkg_wedding_varmala.jpg",
        description:"Photo + cinematic storytelling with stage celebrations.",
        features:[
            "Candid photos + traditional videos",
            "Cinematic highlight teaser",
            "Drone venue aerials",
            "Digital gallery & prints"
        ]
    }

],


birthday:[

    {
        id:"pkg_bday_1",
        name:"Birthday Party Special",
        price:"₹4,999/-",
        tag:"POPULAR",
        image:"pkg_birthday_cake.jpg",
        description:"2 hours coverage for birthday celebration and cake cutting.",
        features:[
            "1 Professional Event Photographer",
            "2 hours of party coverage",
            "All RAW images delivered",
            "30 edited photos included"
        ]
    },

    {
        id:"pkg_bday_2",
        name:"Signature Celebration & DJ Party",
        price:"₹7,999/-",
        tag:"POPULAR",
        image:"pkg_birthday_parties.jpg",
        description:"3 hours coverage for milestone parties and dance celebration.",
        features:[
            "3 hours coverage",
            "Candid photography + short reel",
            "Cake cutting and stage moments",
            "Edited photos in 48 hours"
        ]
    }

],


party:[

    {
        id:"pkg_party_1",
        name:"Basic Event",
        price:"₹5,999/-",
        tag:"STARTER",
        image:"pkg_birthday_parties.jpg",
        description:"Ideal for smaller private events.",
        features:[
            "2 hours photography",
            "1 photographer",
            "Edited photographs",
            "Digital delivery"
        ]
    },

    {
        id:"pkg_party_2",
        name:"Grand Gala Evening",
        price:"₹14,999/-",
        tag:"PREMIUM",
        image:"pkg_wedding_night.jpg",
        description:"Photo + video event coverage.",
        features:[
            "5–6 hours",
            "Photo + video",
            "Candid",
            "Reels",
            "Highlight",
            "Online gallery"
        ]
    }

],


corporate:[

    {
        id:"pkg_corp_1",
        name:"Corporate Headshots & Team",
        price:"₹9,999/-",
        tag:"BUSINESS",
        image:"pkg_corporate_headshot.jpg",
        description:"High-impact headshots and office ambiance shoot.",
        features:[
            "Mobile studio flash setup at your office",
            "Up to 10 executive portraits",
            "Skin retouched & LinkedIn formatted",
            "Commercial usage rights"
        ]
    },

    {
        id:"pkg_corp_2",
        name:"Corporate Event & Full Day",
        price:"₹20,000/-",
        tag:"POPULAR",
        image:"pkg_inst_10hr.jpg",
        description:"Full day conference, seminar and brand production coverage.",
        features:[
            "Up to 8 hours documentation",
            "Keynote, audience and stage coverage",
            "Social media highlights reel",
            "Fast digital delivery"
        ]
    }

],


commercial:[

    {
        id:"pkg_comm_1",
        name:"Product & E-Commerce",
        price:"₹7,499/-",
        tag:"COMMERCIAL",
        image:"pkg_product_ecommerce.jpg",
        description:"Clean white background & lifestyle product photography.",
        features:[
            "Up to 15 product items",
            "Clean cutout & lifestyle framing",
            "Optimized for Amazon/Flipkart/Web",
            "Color accurate retouching"
        ]
    },

    {
        id:"pkg_comm_2",
        name:"Food, Culinary & Brand",
        price:"₹15,000/-",
        tag:"POPULAR",
        image:"pkg_food_catalogue.jpg",
        description:"Stylized gourmet food and high-conversion restaurant menus.",
        features:[
            "Up to 20 styled dishes or products",
            "Macro textures & overhead flat-lays",
            "Commercial licensing included",
            "Print and web ready"
        ]
    }

],


portrait:[

    {
        id:"pkg_port_1",
        name:"Personal & Couple Portrait",
        price:"₹2,499/-",
        tag:"INDIVIDUAL",
        image:"pkg_couples_portraits.jpg",
        description:"1-hour session for portraits, couples or personal branding.",
        features:[
            "1-hour doorstep session",
            "15 retouched portraits",
            "Lighting equipment included",
            "Digital cloud album"
        ]
    },

    {
        id:"pkg_port_2",
        name:"Signature Story & Maternity",
        price:"₹4,999/-",
        tag:"PREMIUM",
        image:"pkg_maternity_portrait.jpg",
        description:"Fine-art maternity and lifestyle portrait storytelling.",
        features:[
            "2 Hours dedicated session",
            "35 Color-graded high-res photos",
            "Outfit and styling guidance",
            "Expedited delivery"
        ]
    }

],


custom:[

    {
        name:"Custom Photography",
        price:"Custom Quote",
        tag:"BESPOKE",
        image:"https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?auto=format&fit=crop&w=600&q=80",
        description:"Tell us exactly what you need.",
        features:[
            "Custom duration",
            "Custom team",
            "Photo",
            "Video",
            "Drone",
            "Reels",
            "Albums",
            "Custom deliverables"
        ]
    }

]

},


/* =========================================================
   SALON
========================================================= */

salon:{


bridal:[

    {
        name:"Basic Bridal",
        price:"₹7,999/-",
        tag:"STARTER",
        image:"https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
        description:"Affordable complete bridal look.",
        features:[
            "Bridal makeup",
            "Basic hairstyling",
            "Lashes",
            "Basic draping",
            "Professional products"
        ]
    },

    {
        name:"HD Bridal",
        price:"₹12,999/-",
        tag:"POPULAR",
        image:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
        description:"Camera-ready HD bridal experience.",
        features:[
            "HD makeup",
            "Advanced hairstyling",
            "Lashes",
            "Saree/lehenga draping",
            "Eye makeup",
            "Professional products"
        ]
    },

    {
        name:"Luxury Bridal",
        price:"₹19,999/-",
        tag:"PREMIUM",
        image:"https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
        description:"Premium bridal transformation.",
        features:[
            "Luxury makeup",
            "Advanced hairstyle",
            "Premium lashes",
            "Draping",
            "Lens",
            "Jewellery setting",
            "Final look setting"
        ]
    }

],


engagement:[

    {
        name:"Basic Engagement",
        price:"₹4,999/-",
        tag:"STARTER",
        image:"https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
        description:"Elegant engagement look.",
        features:[
            "Makeup",
            "Basic hairstyle",
            "Draping",
            "Eye makeup"
        ]
    },

    {
        name:"HD Engagement",
        price:"₹7,499/-",
        tag:"POPULAR",
        image:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
        description:"Professional HD engagement look.",
        features:[
            "HD makeup",
            "Advanced hair",
            "Lashes",
            "Draping",
            "Eye makeup"
        ]
    },

    {
        name:"Premium Engagement",
        price:"₹9,999/-",
        tag:"PREMIUM",
        image:"https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
        description:"Complete premium styling.",
        features:[
            "Premium makeup",
            "Advanced hairstyle",
            "Lenses",
            "Draping",
            "Jewellery setting"
        ]
    }

],


reception:[

    {
        name:"Reception Basic",
        price:"₹7,999/-",
        tag:"STARTER",
        image:"https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
        description:"Beautiful reception-ready look.",
        features:[
            "Makeup",
            "Hair styling",
            "Eye makeup",
            "Draping"
        ]
    },

    {
        name:"Reception HD",
        price:"₹11,999/-",
        tag:"POPULAR",
        image:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
        description:"HD reception transformation.",
        features:[
            "HD makeup",
            "Advanced hair",
            "Lashes",
            "Draping",
            "Premium finish"
        ]
    },

    {
        name:"Reception Luxe",
        price:"₹15,999/-",
        tag:"PREMIUM",
        image:"https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
        description:"Luxury reception styling.",
        features:[
            "Luxury makeup",
            "Premium hair",
            "Lashes",
            "Lenses",
            "Draping",
            "Jewellery setting"
        ]
    }

],


party:[

    {
        name:"Party Makeup",
        price:"₹1,499/-",
        tag:"POPULAR",
        image:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
        description:"Professional party-ready makeup.",
        features:[
            "Base makeup",
            "Eye makeup",
            "Professional finish",
            "At-home service"
        ]
    },

    {
        name:"Party + Hair",
        price:"₹2,499/-",
        tag:"BEST VALUE",
        image:"https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80",
        description:"Makeup and hairstyle together.",
        features:[
            "Party makeup",
            "Hair styling",
            "Eye makeup",
            "Professional finish"
        ]
    },

    {
        name:"Premium Party",
        price:"₹3,999/-",
        tag:"PREMIUM",
        image:"https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
        description:"Premium occasion styling.",
        features:[
            "Premium makeup",
            "Advanced hairstyle",
            "Lashes",
            "Draping"
        ]
    }

],


photoshoot:[

    {
        name:"Camera Ready",
        price:"₹2,499/-",
        tag:"STARTER",
        image:"https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
        description:"Professional makeup for photoshoots.",
        features:[
            "Camera-ready makeup",
            "Basic hair",
            "Skin preparation",
            "Touch-up guidance"
        ]
    },

    {
        name:"HD Shoot",
        price:"₹3,999/-",
        tag:"POPULAR",
        image:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
        description:"HD makeup for professional shoots.",
        features:[
            "HD makeup",
            "Advanced hair",
            "Eye makeup",
            "Lashes"
        ]
    },

    {
        name:"Creative Shoot",
        price:"₹5,999/-",
        tag:"PREMIUM",
        image:"https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
        description:"Creative makeup and styling.",
        features:[
            "Creative makeup",
            "Hair styling",
            "Lashes",
            "Concept styling",
            "Touch-up support"
        ]
    }

],


prebridal:[

    {
        name:"Basic Pre-Bridal",
        price:"₹4,999/-",
        tag:"STARTER",
        image:"https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
        description:"Essential pre-wedding grooming.",
        features:[
            "Facial",
            "Waxing",
            "Threading",
            "Manicure",
            "Pedicure"
        ]
    },

    {
        name:"Complete Pre-Bridal",
        price:"₹7,999/-",
        tag:"POPULAR",
        image:"https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
        description:"Complete beauty preparation.",
        features:[
            "Premium facial",
            "Full waxing",
            "Threading",
            "Manicure",
            "Pedicure",
            "Hair spa"
        ]
    },

    {
        name:"Luxury Pre-Bridal",
        price:"₹12,999/-",
        tag:"PREMIUM",
        image:"https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
        description:"Full beauty preparation package.",
        features:[
            "Premium facial",
            "Full body grooming",
            "Manicure",
            "Pedicure",
            "Hair spa",
            "Skin preparation",
            "Head massage"
        ]
    }

],


grooming:[

    {
        name:"Essential Grooming",
        price:"₹999/-",
        tag:"STARTER",
        image:"https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
        description:"Quick basic grooming.",
        features:[
            "Threading",
            "Cleanup",
            "Basic grooming"
        ]
    },

    {
        name:"Complete Grooming",
        price:"₹1,999/-",
        tag:"POPULAR",
        image:"https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
        description:"Complete at-home grooming.",
        features:[
            "Facial",
            "Threading",
            "Waxing",
            "Manicure",
            "Pedicure"
        ]
    },

    {
        name:"Premium Grooming",
        price:"₹3,499/-",
        tag:"PREMIUM",
        image:"https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
        description:"Premium self-care session.",
        features:[
            "Premium facial",
            "Waxing",
            "Manicure",
            "Pedicure",
            "Head massage"
        ]
    }

],


makeup:[

    {
        name:"Basic Makeup",
        price:"₹1,499/-",
        tag:"STARTER",
        image:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
        description:"Professional basic makeup.",
        features:[
            "Base makeup",
            "Basic eye makeup",
            "Professional finish"
        ]
    },

    {
        name:"HD Makeup",
        price:"₹2,499/-",
        tag:"POPULAR",
        image:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
        description:"HD finish for events.",
        features:[
            "HD base",
            "Advanced eye makeup",
            "Lashes",
            "Long-lasting finish"
        ]
    },

    {
        name:"Premium Makeup",
        price:"₹3,999/-",
        tag:"PREMIUM",
        image:"https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
        description:"Complete premium makeup.",
        features:[
            "Premium products",
            "Advanced eye makeup",
            "Lashes",
            "Skin preparation"
        ]
    }

],


hair:[

    {
        name:"Basic Hair",
        price:"₹599/-",
        tag:"STARTER",
        image:"https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80",
        description:"Simple occasion styling.",
        features:[
            "Curls",
            "Straightening",
            "Simple bun"
        ]
    },

    {
        name:"Advanced Hair",
        price:"₹999/-",
        tag:"POPULAR",
        image:"https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80",
        description:"Professional occasion styling.",
        features:[
            "Advanced styling",
            "Curls",
            "Bun/braid",
            "Finishing"
        ]
    },

    {
        name:"Premium Hair",
        price:"₹1,499/-",
        tag:"PREMIUM",
        image:"https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80",
        description:"Detailed premium hairstyling.",
        features:[
            "Advanced hairstyle",
            "Hair accessories",
            "Premium finishing"
        ]
    }

],


custom:[

    {
        name:"Custom Salon Service",
        price:"Custom Quote",
        tag:"BESPOKE",
        image:"https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
        description:"Tell us which services you need.",
        features:[
            "Makeup",
            "Hair",
            "Skin",
            "Nails",
            "Grooming",
            "Bridal",
            "Custom combinations"
        ]
    }

]

},


/* =========================================================
   TRAVEL
========================================================= */

travel:{

    honeymoon:[

        {
            name:"Classic Honeymoon",
            price:"Custom Quote",
            tag:"CURATED",
            image:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80",
            description:"Romantic domestic honeymoon tailored to your style.",
            features:[
                "Destination planning",
                "Hotel options",
                "Transport options",
                "Sightseeing",
                "Basic itinerary"
            ]
        },

        {
            name:"Comfort Honeymoon",
            price:"Custom Quote",
            tag:"POPULAR",
            image:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80",
            description:"Comfort-focused romantic holiday.",
            features:[
                "Better hotel category",
                "Transfers",
                "Sightseeing",
                "Romantic experiences",
                "Complete itinerary"
            ]
        },

        {
            name:"Premium Honeymoon",
            price:"Custom Quote",
            tag:"PREMIUM",
            image:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80",
            description:"Premium honeymoon experience.",
            features:[
                "Premium stays",
                "Private transfers",
                "Experiences",
                "Sightseeing",
                "Custom itinerary",
                "Travel assistance"
            ]
        }

    ],


    family:[

        {
            name:"Classic Family",
            price:"Custom Quote",
            tag:"CURATED",
            image:"https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80",
            description:"Curated family holiday.",
            features:[
                "Destination planning",
                "Handpicked stay options",
                "Transport",
                "Sightseeing"
            ]
        },

        {
            name:"Family Comfort",
            price:"Custom Quote",
            tag:"POPULAR",
            image:"https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80",
            description:"Comfortable family trip.",
            features:[
                "3-star/4-star options",
                "Transfers",
                "Sightseeing",
                "Family-friendly itinerary"
            ]
        },

        {
            name:"Family Premium",
            price:"Custom Quote",
            tag:"PREMIUM",
            image:"https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80",
            description:"Premium family holiday.",
            features:[
                "Premium hotels",
                "Private transfers",
                "Activities",
                "Custom itinerary"
            ]
        }

    ],


    solo:[

        {
            name:"Classic Solo",
            price:"Custom Quote",
            tag:"CURATED",
            image:"https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80",
            description:"Independent solo journey.",
            features:[
                "Destination plan",
                "Comfortable stay",
                "Transport",
                "Sightseeing"
            ]
        },

        {
            name:"Solo Comfort",
            price:"Custom Quote",
            tag:"POPULAR",
            image:"https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80",
            description:"Comfortable independent trip.",
            features:[
                "Better hotels",
                "Transfers",
                "Activities",
                "Custom itinerary"
            ]
        },

        {
            name:"Solo Premium",
            price:"Custom Quote",
            tag:"PREMIUM",
            image:"https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80",
            description:"Premium solo experience.",
            features:[
                "Premium stays",
                "Private experiences",
                "Activities",
                "Travel assistance"
            ]
        }

    ],


    group:[

        {
            name:"Classic Group",
            price:"Custom Quote",
            tag:"VALUE",
            image:"https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=600&q=80",
            description:"Large group travel tailored to your group needs.",
            features:[
                "Group hotel",
                "Transport",
                "Sightseeing",
                "Group itinerary"
            ]
        },

        {
            name:"Group Comfort",
            price:"Custom Quote",
            tag:"POPULAR",
            image:"https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=600&q=80",
            description:"Comfortable group holiday.",
            features:[
                "Better hotels",
                "Dedicated transport",
                "Activities",
                "Group coordinator"
            ]
        },

        {
            name:"Group Premium",
            price:"Custom Quote",
            tag:"PREMIUM",
            image:"https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=600&q=80",
            description:"Premium group travel.",
            features:[
                "Premium stays",
                "Private transport",
                "Experiences",
                "Dedicated assistance"
            ]
        }

    ],


    adventure:[

        {
            name:"Classic Adventure",
            price:"Custom Quote",
            tag:"STARTER",
            image:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
            description:"Short adventure experience.",
            features:[
                "Activity planning",
                "Stay options",
                "Transport",
                "Basic itinerary"
            ]
        },

        {
            name:"Adventure Plus",
            price:"Custom Quote",
            tag:"POPULAR",
            image:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
            description:"Multi-activity adventure trip.",
            features:[
                "Multiple activities",
                "Stay",
                "Transfers",
                "Sightseeing"
            ]
        },

        {
            name:"Adventure Custom",
            price:"Custom Quote",
            tag:"BESPOKE",
            image:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
            description:"Fully customised adventure.",
            features:[
                "Trekking",
                "Camping",
                "Rafting",
                "Transfers",
                "Equipment",
                "Custom itinerary"
            ]
        }

    ],


    international:[

        {
            name:"Curated International",
            price:"Custom Quote",
            tag:"CURATED",
            image:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
            description:"Curated international holiday tailored around your preferences.",
            features:[
                "Destination planning",
                "Visa guidance",
                "Hotels",
                "Flights",
                "Sightseeing"
            ]
        },

        {
            name:"International Comfort",
            price:"Custom Quote",
            tag:"POPULAR",
            image:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
            description:"Comfort international package.",
            features:[
                "Flights",
                "Hotels",
                "Transfers",
                "Activities",
                "Visa guidance"
            ]
        },

        {
            name:"International Premium",
            price:"Custom Quote",
            tag:"PREMIUM",
            image:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
            description:"Premium international experience.",
            features:[
                "Premium hotels",
                "Private transfers",
                "Experiences",
                "Visa assistance",
                "Complete itinerary"
            ]
        }

    ],


    spiritual:[

        {
            name:"Classic Spiritual",
            price:"Custom Quote",
            tag:"CURATED",
            image:"https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80",
            description:"Simple pilgrimage itinerary.",
            features:[
                "Transport planning",
                "Stay",
                "Darshan planning",
                "Sightseeing"
            ]
        },

        {
            name:"Spiritual Comfort",
            price:"Custom Quote",
            tag:"POPULAR",
            image:"https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80",
            description:"Comfort-focused pilgrimage.",
            features:[
                "Better hotels",
                "Transfers",
                "Darshan",
                "Sightseeing",
                "Complete itinerary"
            ]
        },

        {
            name:"Spiritual Premium",
            price:"Custom Quote",
            tag:"PREMIUM",
            image:"https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80",
            description:"Premium pilgrimage experience.",
            features:[
                "Premium stays",
                "Private transport",
                "Priority planning",
                "Multiple destinations"
            ]
        }

    ],


    roadtrip:[

        {
            name:"Classic Road Trip",
            price:"Custom Quote",
            tag:"STARTER",
            image:"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
            description:"Simple road trip planning.",
            features:[
                "Route planning",
                "Stay suggestions",
                "Sightseeing",
                "Itinerary"
            ]
        },

        {
            name:"Road Trip Comfort",
            price:"Custom Quote",
            tag:"POPULAR",
            image:"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
            description:"Complete road trip planning.",
            features:[
                "Route planning",
                "Hotels",
                "Activities",
                "Transport planning",
                "Detailed itinerary"
            ]
        },

        {
            name:"Road Trip Custom",
            price:"Custom Quote",
            tag:"BESPOKE",
            image:"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
            description:"Long-distance or multi-city road trips.",
            features:[
                "Multi-city route",
                "Hotels",
                "Activities",
                "Vehicle planning",
                "Complete itinerary"
            ]
        }

    ],


    corporate:[

        {
            name:"Corporate Basic",
            price:"Custom Quote",
            tag:"STARTER",
            image:"https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80",
            description:"Business travel planning.",
            features:[
                "Flights",
                "Hotels",
                "Transfers",
                "Basic itinerary"
            ]
        },

        {
            name:"Corporate Group",
            price:"Custom Quote",
            tag:"POPULAR",
            image:"https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80",
            description:"Complete corporate group travel.",
            features:[
                "Group flights",
                "Hotels",
                "Transport",
                "Event coordination",
                "Travel support"
            ]
        },

        {
            name:"Corporate Premium",
            price:"Custom Quote",
            tag:"PREMIUM",
            image:"https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80",
            description:"End-to-end corporate travel management.",
            features:[
                "Premium hotels",
                "Private transfers",
                "Events",
                "Activities",
                "Dedicated assistance"
            ]
        }

    ],


    custom:[

        {
            name:"Fully Custom Trip",
            price:"Custom Quote",
            tag:"BESPOKE",
            image:"https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80",
            description:"You tell us what you want. We build the itinerary.",
            features:[
                "Any destination",
                "Any duration",
                "Custom hotel",
                "Flights",
                "Transport",
                "Activities",
                "Custom preferences",
                "Personalised itinerary"
            ]
        }

    ]

}

};


/* =========================================================
   SELECT SERVICE
========================================================= */

function selectService(service){

    booking.service = service;

    booking.event = "";
    booking.package = "";
    booking.price = "";
    booking.details = {};

    renderEvents();

    const urlParams = new URLSearchParams(window.location.search);
    const initialEvent = urlParams.get("event") || urlParams.get("requirement") || urlParams.get("booking");

    if (initialEvent && events[booking.service]) {
        const matched = events[booking.service].find(
            item => item.id.toLowerCase() === initialEvent.toLowerCase()
        );
        if (matched) {
            booking.event = matched.id;
            booking.eventName = matched.name;

            const grid = document.getElementById("eventGrid");
            if (grid) {
                const cards = grid.querySelectorAll(".event-card");
                events[booking.service].forEach((ev, idx) => {
                    if (ev.id === matched.id && cards[idx]) {
                        cards[idx].classList.add("active");
                    }
                });
            }

            const nextBtn = document.getElementById("eventNext");
            if (nextBtn) nextBtn.disabled = false;

            goToPackages();

            if (matched.id === "instant") {
                selectPackage("Instant Shoot (1 Hour)", "₹1,499/-", false);
            }
            return;
        }
    }

    goStep(2);
}


/* =========================================================
   RENDER EVENTS
========================================================= */

function renderEvents(){

    const grid = document.getElementById("eventGrid");

    grid.innerHTML = "";

    // Preserve all comprehensive original events
    let eventList = [...(events[booking.service] || [])];

    // If photography, dynamically sync instant shoot price into description without removing any options
    if (booking.service === "photographer" && window.SweepSageCatalog) {
        const catalogServices = window.SweepSageCatalog.getPhotographyServices();
        const inst = catalogServices.find(s => s.id === "instant");
        if (inst) {
            const evInstant = eventList.find(e => e.id === "instant");
            if (evInstant) {
                evInstant.description = `Book in minutes (${inst.price}): Professional photographer at your doorstep for portraits and special moments.`;
            }
        }
    }

    eventList.forEach(event => {

        const card = document.createElement("button");

        card.type = "button";

        card.className = "event-card" + (booking.event === event.id ? " active" : "");

        card.innerHTML = `

            <div class="event-icon">
                ${event.icon}
            </div>

            <h3>
                ${event.name}
            </h3>

            <p>
                ${event.description}
            </p>

        `;

        card.onclick = function(){

            document
                .querySelectorAll(".event-card")
                .forEach(x => x.classList.remove("active"));

            card.classList.add("active");

            booking.event = event.id;
            booking.eventName = event.name;

            const evNext = document.getElementById("eventNext");
            if (evNext) evNext.disabled = false;

            // Automatically proceed to packages so the user doesn't have to select another button
            goToPackages();

        };

        grid.appendChild(card);

    });


    const names = {

        photographer:"Photography",
        salon:"Salon at Home",
        travel:"Travel"

    };

    document.getElementById("eventHeading").innerText =
        booking.service === "travel"
        ? "What kind of trip are you planning?"
        : `What are you planning for ${names[booking.service]}?`;
    document.getElementById("eventDescription").innerText = pageCopy.eventDescription;

}


/* =========================================================
   GO TO PACKAGES
========================================================= */

function goToPackages(){

    if(!booking.event) return;

    // Remove / hide continue buttons on price list
    const packageNext = document.getElementById("packageNext");
    if (packageNext) packageNext.style.display = "none";
    const eventNext = document.getElementById("eventNext");
    if (eventNext) eventNext.style.display = "none";

    renderPackages();

    goStep(3);
}


/* =========================================================
   RENDER PACKAGES
========================================================= */

function renderPackages(){

    const grid =
        document.getElementById("packageGrid");

    grid.innerHTML = "";

    let list =
        (packages[booking.service] && packages[booking.service][booking.event]) || [];

    // Dynamically synchronize photography pricing & newly added packages from dashboard catalog
    if (booking.service === "photographer" && window.SweepSageCatalog) {
        // Sync instant shoot price if applicable
        if (booking.event === "instant") {
            const inst = window.SweepSageCatalog.getPhotographyServices().find(s => s.id === "instant");
            if (inst && list.length > 0) {
                list[0].price = inst.price;
                list[0].tag = `SWEEPSAGE USP — JUST ${inst.price}`;
            }
        }

        // Incorporate custom or edited packages created from the dashboard CMS for this category
        try {
            const catPkgs = window.SweepSageCatalog.getPhotographyPackages(booking.event);
            if (Array.isArray(catPkgs) && catPkgs.length > 0) {
                catPkgs.forEach(cp => {
                    const existing = list.find(item => item.id === cp.id || (item.name && item.name.toLowerCase() === cp.name.toLowerCase()));
                    if (existing) {
                        if (cp.price) existing.price = cp.price;
                        if (cp.tag) existing.tag = cp.tag;
                        if (cp.image) existing.image = cp.image;
                        if (cp.description) existing.description = cp.description;
                        if (Array.isArray(cp.features) && cp.features.length) existing.features = cp.features;
                    } else if (cp.name && cp.price) {
                        list.push({
                            id: cp.id || ("pkg_" + Date.now()),
                            tag: cp.tag || "EXCLUSIVE CMS",
                            name: cp.name,
                            price: cp.price,
                            image: cp.image || "pkg_instant_shoot.jpg",
                            description: cp.description || "Curated photography package configured via dashboard.",
                            features: (Array.isArray(cp.features) && cp.features.length) ? cp.features : ["1 Verified Professional Photographer", "Digital delivery within 24 hours", "Color-graded high-resolution photos"]
                        });
                    }
                });
            }
        } catch (err) {
            console.warn("Could not merge catalog packages", err);
        }
    }

    const travel = booking.service === "travel";

    document.getElementById("travelQuote").style.display =
        travel ? "block" : "none";

    const serviceFallbackImages = {
        photographer: "pkg_instant_shoot.jpg",
        instant: "pkg_instant_shoot.jpg",
        wedding: "pkg_wedding_celebration.jpg",
        prewedding: "pkg_prewed_sunset.jpg",
        engagement: "pkg_engagement_ring.jpg",
        birthday: "pkg_birthday_cake.jpg",
        party: "pkg_birthday_parties.jpg",
        corporate: "pkg_corporate_headshot.jpg",
        commercial: "pkg_product_ecommerce.jpg",
        portrait: "pkg_maternity_portrait.jpg",
        salon: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
        travel: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80"
    };

    list.forEach((item,index)=>{

        const card =
            document.createElement("div");

        card.className =
            "package" +
            (index === 1 ? " popular" : "") +
            (booking.package === item.name ? " selected" : "");

        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");

        const photoUrl = item.image || serviceFallbackImages[booking.event] || serviceFallbackImages[booking.service] || serviceFallbackImages.photographer;

        card.innerHTML = `

            <div class="package-media">
                <img src="${photoUrl}" alt="${item.name}" class="package-img" loading="lazy" />
                <span class="package-tag-badge">${item.tag || "SWEEPSAGE"}</span>
            </div>

            <span class="package-tag" style="display:none;">
                ${item.tag}
            </span>

            <h3>
                ${item.name}
            </h3>

            <div class="package-price">
                ${item.price}
            </div>

            <p class="package-description">
                ${item.description}
            </p>

            <ul>
                ${item.features
                    .map(f => `<li>${f}</li>`)
                    .join("")}
            </ul>

            <button
                class="package-button"
                type="button">

                Select ${item.name}

            </button>

        `;


        function selectThisPackage(proceedImmediately){

            document
                .querySelectorAll(".package")
                .forEach(x => {
                    x.classList.remove("selected");
                    const btn = x.querySelector(".package-button");
                    if (btn) btn.classList.remove("has-red-underline");
                });

            card.classList.add("selected");
            const btn = card.querySelector(".package-button");
            if (btn) btn.classList.add("has-red-underline");

            const tenOffer = document.getElementById("tenMinuteOffer");
            if (tenOffer) {
                tenOffer.classList.remove("selected");
                const tenBtn = tenOffer.querySelector(".ten-button");
                if (tenBtn) tenBtn.classList.remove("has-red-underline");
            }

            booking.package =
                item.name;

            booking.price =
                item.price;

            // Remove / hide continue buttons when price list is clicked
            const packageNext = document.getElementById("packageNext");
            if (packageNext) packageNext.style.display = "none";
            const eventNext = document.getElementById("eventNext");
            if (eventNext) eventNext.style.display = "none";

            showToast(
                `${item.name} (${item.price}) selected`
            );

            if (window._packageTimer) clearTimeout(window._packageTimer);
            if (proceedImmediately) {
                goToDetails();
            } else {
                window._packageTimer = setTimeout(() => {
                    goToDetails();
                }, 180);
            }

        }

        // Entire card acts as a button to select and advance
        card.onclick = function() {
            selectThisPackage(false);
        };

        const cardBtn = card.querySelector(".package-button");
        if (cardBtn) {
            cardBtn.onclick = function(e){
                e.stopPropagation();
                selectThisPackage(true);
            };
        }

        card.onkeydown = function(e){
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectThisPackage(true);
            }
        };


        grid.appendChild(card);

    });

    // Hook up ten-button click for photography only
    const tenOfferEl = document.getElementById("tenMinuteOffer");
    if (tenOfferEl) {
        if (booking.service !== "photographer") {
            tenOfferEl.style.display = "none";
        } else {
            tenOfferEl.style.display = "";
            tenOfferEl.onclick = function(e){
                selectPackage("Instant Shoot (1 Hour)", "₹1,499/-", true);
            };
            const tenBtn = tenOfferEl.querySelector(".ten-button");
            if (tenBtn) {
                tenBtn.onclick = function(e){
                    e.stopPropagation();
                    selectPackage("Instant Shoot (1 Hour)", "₹1,499/-", true);
                };
            }
        }
    }

    if (booking.event === "instant" && list.length > 0) {
        selectPackage(list[0].name, list[0].price, false);
    }

    document.getElementById("packageHeading").innerText =
        travel
        ? "Choose your travel style."
        : `Choose your ${booking.service === "photographer" ? "photography" : "beauty"} package.`;

}


/* =========================================================
   QUICK 10 MIN PACKAGE
========================================================= */

function selectPackage(name,price,autoAdvance = true){

    booking.package = name;
    booking.price = price;

    document
        .querySelectorAll(".package")
        .forEach(x => {
            const heading = x.querySelector("h3");
            const btn = x.querySelector(".package-button");
            if (heading && heading.textContent.trim().toLowerCase().includes(name.toLowerCase())) {
                x.classList.add("selected");
                if (btn) btn.classList.add("has-red-underline");
            } else {
                x.classList.remove("selected");
                if (btn) btn.classList.remove("has-red-underline");
            }
        });

    const tenOffer = document.getElementById("tenMinuteOffer");
    if (tenOffer) {
        const tenBtn = tenOffer.querySelector(".ten-button");
        if (name.toLowerCase().includes("instant") || name.toLowerCase().includes("10-min")) {
            tenOffer.classList.add("selected");
            if (tenBtn) tenBtn.classList.add("has-red-underline");
        } else {
            tenOffer.classList.remove("selected");
            if (tenBtn) tenBtn.classList.remove("has-red-underline");
        }
    }

    // Remove / hide continue buttons when price list is clicked
    const packageNext = document.getElementById("packageNext");
    if (packageNext) packageNext.style.display = "none";
    const eventNext = document.getElementById("eventNext");
    if (eventNext) eventNext.style.display = "none";

    showToast(`${name} (${price}) selected`);

    if (autoAdvance) {
        if (window._packageTimer) clearTimeout(window._packageTimer);
        window._packageTimer = setTimeout(() => {
            goToDetails();
        }, 180);
    }

}


/* =========================================================
   DETAILS
========================================================= */

function goToDetails(){

    if(!booking.package){

        showToast("Please select a package first");

        return;

    }

    renderForm();

    goStep(4);

    const step4 = document.getElementById("step4");
    if (step4) {
        step4.scrollIntoView({ behavior: "smooth", block: "start" });
    }

}


/* =========================================================
   FORM BUILDER
========================================================= */

function field(
    name,
    label,
    type="text",
    placeholder="",
    required=true
){

    return `

        <div class="form-group">

            <label>
                ${label}
                ${required ? "<span>*</span>" : ""}
            </label>

            <input
                class="form-control"
                name="${name}"
                type="${type}"
                placeholder="${placeholder}"
                ${required ? "required" : ""}
            >

        </div>

    `;

}


function textarea(
    name,
    label,
    placeholder=""
){

    return `

        <div class="form-group full">

            <label>
                ${label}
                <span>optional</span>
            </label>

            <textarea
                class="form-control"
                name="${name}"
                placeholder="${placeholder}">
            </textarea>

        </div>

    `;

}


/* =========================================================
   RENDER FORM BY SERVICE
========================================================= */

function renderForm(){

    const form =
        document.getElementById("formFields");

    let html = "";


    /* ================= PHOTOGRAPHER ================= */

    if(booking.service === "photographer"){

        html += field(
            "name",
            "Your Full Name",
            "text",
            "Enter your name"
        );

        html += field(
            "phone",
            "WhatsApp Number",
            "tel",
            "10-digit mobile number"
        );

        html += field(
            "date",
            "Event / Shoot Date",
            "date"
        );

        html += field(
            "time",
            "Preferred Start Time",
            "time"
        );

        html += field(
            "location",
            "Shoot / Event Location",
            "text",
            "Area, city or venue"
        );

        html += field(
            "duration",
            "Required Duration",
            "text",
            "e.g. 2 hours"
        );

        html += field(
            "people",
            "Approx. Number of People",
            "number",
            "e.g. 50"
        );

        html += field(
            "functions",
            "Number of Functions",
            "text",
            "e.g. 2 functions"
        );

        html += field(
            "video",
            "Need Video?",
            "text",
            "Yes / No / Not sure"
        );

        html += field(
            "drone",
            "Need Drone?",
            "text",
            "Yes / No"
        );

        html += field(
            "reels",
            "Need Instagram Reels?",
            "text",
            "Yes / No"
        );

        html += textarea(
            "message",
            "Additional Requirements",
            "Tell us anything else..."
        );

    }


    /* ================= SALON ================= */

    if(booking.service === "salon"){

        html += field(
            "name",
            "Your Full Name",
            "text",
            "Enter your name"
        );

        html += field(
            "phone",
            "WhatsApp Number",
            "tel",
            "10-digit mobile number"
        );

        html += field(
            "date",
            "Service Date",
            "date"
        );

        html += field(
            "time",
            "Preferred Time",
            "time"
        );

        html += field(
            "location",
            "Service Location",
            "text",
            "Area / locality"
        );

        html += field(
            "people",
            "Number of People",
            "number",
            "e.g. 1"
        );

        html += field(
            "gender",
            "Client / Group",
            "text",
            "Bride / Women / Men / Family"
        );

        html += field(
            "products",
            "Preferred Product Level",
            "text",
            "Standard / Premium"
        );

        html += field(
            "skin",
            "Skin / Hair Concerns",
            "text",
            "Optional"
        );

        html += textarea(
            "message",
            "Additional Beauty Requirements",
            "Tell us what else you need..."
        );

    }


    /* ================= TRAVEL ================= */

    if(booking.service === "travel"){

        html += field(
            "name",
            "Lead Traveller Name",
            "text",
            "Enter your name"
        );

        html += field(
            "phone",
            "WhatsApp Number",
            "tel",
            "10-digit mobile number"
        );

        html += field(
            "email",
            "Email Address",
            "email",
            "you@example.com"
        );

        html += field(
            "travellers",
            "Number of Travellers",
            "number",
            "Adults + children"
        );

        html += field(
            "from",
            "Departure City",
            "text",
            "e.g. Lucknow"
        );

        html += field(
            "destination",
            "Destination",
            "text",
            "Where do you want to go?"
        );

        html += field(
            "departure",
            "Departure Date",
            "date"
        );

        html += field(
            "return",
            "Return Date",
            "date"
        );

        html += field(
            "hotel",
            "Hotel Preference",
            "text",
            "Boutique / 3 Star / 4 Star / 5 Star / Resort"
        );

        html += field(
            "transport",
            "Transport Preference",
            "text",
            "Flight / Train / Cab / Bus / Self Drive"
        );

        html += field(
            "stayType",
            "Stay & Experience Style",
            "text",
            "e.g. Heritage, Luxury, Villa, Resort"
        );

        html += textarea(
            "message",
            "Trip Requirements",
            "Activities, places, hotel preferences, food requirements, special occasions etc."
        );

    }


    form.innerHTML = html;

}


/* =========================================================
   REVIEW
========================================================= */

function reviewRequest(event){

    event.preventDefault();

    const form =
        document.getElementById("detailsForm");

    const data =
        new FormData(form);

    booking.details = {};

    data.forEach((value,key)=>{

        booking.details[key] = value;

    });


    renderReview();

    goStep(5);

}


/* =========================================================
   REVIEW BUILDER
========================================================= */

function renderReview(){

    const area =
        document.getElementById("reviewArea");

    const serviceNames = {

        photographer:"Photography",
        salon:"Salon at Home",
        travel:"Travel"

    };


    let detailsHTML = "";

    Object.entries(booking.details)
    .forEach(([key,value])=>{

        if(!value) return;

        const label =
            key
            .replace(/([A-Z])/g," $1")
            .replace(/^./,
                x => x.toUpperCase()
            );

        detailsHTML += `

            <div class="review-row">

                <span>
                    ${label}
                </span>

                <span>
                    ${value}
                </span>

            </div>

        `;

    });


    area.innerHTML = `

        <div class="review-card">

            <h3>
                Booking Summary
            </h3>

            <div class="review-row">

                <span>
                    Service
                </span>

                <span>
                    ${serviceNames[booking.service]}
                </span>

            </div>

            <div class="review-row">

                <span>
                    Requirement
                </span>

                <span>
                    ${booking.eventName}
                </span>

            </div>

            <div class="review-row">

                <span>
                    Package
                </span>

                <span>
                    ${booking.package}
                </span>

            </div>

            ${detailsHTML}

        </div>


        <div class="review-card review-price">

            <h3>
                Selected Package
            </h3>

            <div class="review-row">

                <span>
                    Package
                </span>

                <span>
                    ${booking.package}
                </span>

            </div>

            <div class="review-row">

                <span>
                    Indicative Price
                </span>

                <span>
                    <strong>
                        ${booking.price}
                    </strong>
                </span>

            </div>

            <div class="notice">

                Final price may change after checking
                exact date, location, availability,
                travel requirements and additional services.

            </div>

        </div>

    `;

}


/* =========================================================
   WHATSAPP & BACKEND BOOKING SUBMISSION
========================================================= */

async function sendWhatsApp(){

    const whatsappNumber =
        "919555826615";

    const serviceNames = {

        photographer:"Photography",
        salon:"Salon at Home",
        travel:"Travel"

    };

    let refCode = "";

    if (window.SweepSageAPI) {
        showToast("Recording your booking...");
        try {
            const customerName = booking.details.fullName || booking.details.name || booking.details.clientName || "Valued Customer";
            const customerPhone = booking.details.phone || booking.details.mobile || booking.details.whatsapp || "Not provided";
            const customerEmail = booking.details.email || "";
            const location = booking.details.location || booking.details.city || booking.details.destination || "";
            const bookingDate = booking.details.date || booking.details.eventDate || booking.details.shootDate || booking.details.departure || "";
            const bookingTime = booking.details.time || "";

            const payload = {
                service: booking.service || "general",
                event_id: booking.event || "",
                event_name: booking.eventName || "",
                package_name: booking.package || "",
                price: booking.price || "",
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_email: customerEmail,
                location: location,
                booking_date: bookingDate,
                booking_time: bookingTime,
                details: booking.details,
                notes: booking.details.notes || booking.details.message || ""
            };

            const result = await window.SweepSageAPI.createBooking(payload);
            if (result && result.reference) {
                refCode = result.reference;
            }
        } catch (err) {
            console.error("Failed to save booking to backend:", err);
        }
    }


    let message =
`*SWEEPSAGE BOOKING ENQUIRY*
`;

    if (refCode) {
        message += `Booking Reference: ${refCode}\n`;
    }

    message += `Service: ${serviceNames[booking.service] || booking.service}

Requirement: ${booking.eventName}

Package: ${booking.package}

Indicative Price: ${booking.price}

`;

    Object.entries(booking.details)
    .forEach(([key,value])=>{

        if(value){

            const label =
                key
                .replace(/([A-Z])/g," $1")
                .replace(/^./,
                    x => x.toUpperCase()
                );

            message +=
                `${label}: ${value}\n`;

        }

    });


    message += `

I would like to proceed with this SweepSage enquiry.

Please confirm availability and final quotation.

Thank you.
`;

    showToast(refCode ? `Booking saved (#${refCode})! Opening WhatsApp...` : "Opening WhatsApp...");

    const url =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);


    setTimeout(() => {
        window.open(url,"_blank");
    }, 450);

}


/* =========================================================
   STEP NAVIGATION
========================================================= */

function goStep(step){

    currentStep = step;

    document
        .querySelectorAll(".booking-section")
        .forEach(section => {

            section.classList.remove("active");

        });


    document
        .getElementById("step" + step)
        .classList.add("active");


    const stepEl = document.getElementById("stepText");
    if (stepEl) stepEl.innerText = `Step ${step - 1} of 4`;

    const titles = {
        2:"Select Requirement",
        3:"Select Package",
        4:"Enter Details",
        5:"Review Request"
    };

    const progTitleEl = document.getElementById("progressTitle");
    if (progTitleEl) progTitleEl.innerText = titles[step];

    const progFillEl = document.getElementById("progressFill");
    if (progFillEl) progFillEl.style.width = `${(step - 1) * 25}%`;


    if (step === 2 || step === 3) {
        const packageNext = document.getElementById("packageNext");
        if (packageNext) packageNext.style.display = "none";
        const eventNext = document.getElementById("eventNext");
        if (eventNext) eventNext.style.display = "none";
    }

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message){

    const toast =
        document.getElementById("toast");

    toast.innerText = message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2200);

}

const serviceCopy={
photographer:{title:"Photography Booking | SweepSage",icon:"\uD83D\uDCF8",heading:'<span>Instant Photographer</span> \u2014 Starting \u20B91,499/-',copy:"On-demand professional photography for portraits, events, celebrations and special moments.",pageHeading:'Book your <em>photography experience.</em>',intro:"Choose your photography requirement and package, then share your event details. Our team will confirm availability and the final quotation.",eventDescription:"Choose your photography requirement."},
salon:{title:"Salon at Home Booking | SweepSage",icon:"\uD83D\uDC84",heading:"Salon at Home \u2014 Beauty, delivered to you",copy:"Book bridal, makeup, hair, skin and grooming services from the comfort of your home.",pageHeading:'Book your <em>salon experience.</em>',intro:"Choose the beauty service and package you need, then share your preferred date, time and location. Our team will confirm availability and the final quotation.",eventDescription:"Choose the salon or beauty service you would like at home."},
travel:{title:"Travel Planning | SweepSage",icon:"\u2708\uFE0F",heading:"Travel, planned for you \u2014 Your trip, your way",copy:"Tell us your travel style and destination. We will help plan a trip around your dates and personal interests.",pageHeading:'Plan your <em>next journey.</em>',intro:"Choose the kind of trip you have in mind, select a travel style and share your dates, destination and preferences. Our team will prepare a tailored quotation.",eventDescription:"Choose the kind of journey you want us to plan."}
};
const pageService=document.body.dataset.service;
if(!Object.prototype.hasOwnProperty.call(serviceCopy,pageService))throw new Error(`Unsupported booking page service: ${pageService}`);
const pageCopy=serviceCopy[pageService];
document.title=pageCopy.title;
document.getElementById("serviceIcon").textContent=pageCopy.icon;
document.getElementById("uspHeading").innerHTML=pageCopy.heading;
document.getElementById("uspCopy").textContent=pageCopy.copy;
const headingEl = document.getElementById("pageHeading");
if (headingEl) headingEl.innerHTML = pageCopy.pageHeading;
const introEl = document.getElementById("pageIntro");
if (introEl) introEl.textContent = pageCopy.intro;
document.getElementById("uspPrice").hidden=pageService!=="photographer";
document.getElementById("tenMinuteOffer").hidden=pageService!=="photographer";
selectService(pageService);

/* =========================================================
   SMART BACK NAVIGATION
========================================================= */
function smartGoBack() {
    if (window.history.length > 1 && document.referrer && document.referrer !== window.location.href) {
        window.history.back();
        return;
    }
    const prev = sessionStorage.getItem('sweepsage_prev_page');
    if (prev && prev !== window.location.href) {
        window.location.href = prev;
        return;
    }
    if (window.history.length > 1) {
        window.history.back();
        return;
    }
    window.location.href = 'index.html';
}
window.smartGoBack = smartGoBack;

try {
    const cur = window.location.href;
    const last = sessionStorage.getItem('sweepsage_last_url');
    if (last && last !== cur) {
        sessionStorage.setItem('sweepsage_prev_page', last);
    }
    sessionStorage.setItem('sweepsage_last_url', cur);
} catch(e) {}

// Global click outside to dismiss 3-dots more menu
document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-more-dropdown.open').forEach(dd => {
        if (!dd.contains(e.target)) {
            dd.classList.remove('open');
            const trig = dd.querySelector('.nav-more-btn');
            if (trig) trig.setAttribute('aria-expanded', 'false');
        }
    });
});
