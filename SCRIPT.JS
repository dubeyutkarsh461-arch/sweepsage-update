/* =========================================================
   SWEEPSAGE
   JAVASCRIPT
========================================================= */


document.addEventListener("DOMContentLoaded", () => {


  /* =========================================
     SELECTORS
  ========================================== */

  const intro =
    document.querySelector("#introScreen");

  const navbar =
    document.querySelector("#navbar");

  const menuBtn =
    document.querySelector("#menuBtn");

  const navLinks =
    document.querySelector(".nav-links");

  const menuBackdrop =
    document.querySelector("#menuBackdrop");

  const cursorGlow =
    document.querySelector(".cursor-glow");

  const progress =
    document.querySelector(".scroll-progress");

  const modal =
    document.querySelector("#bookingModal");

  const form =
    document.querySelector("#bookingForm");

  const serviceType =
    document.querySelector("#serviceType");

  const modalTitle =
    document.querySelector("#modalTitle");

  const modalSub =
    document.querySelector("#modalSub");

  const toast =
    document.querySelector("#toast");


  /* =========================================
     LOADING SCREEN
  ========================================== */

  const loaderIcons =
    Array.from(document.querySelectorAll("#introScreen .icon"));

  let currentLoaderIcon = 0;
  let loaderInterval;

  function showNextLoaderIcon() {

    const previousIcon =
      loaderIcons[currentLoaderIcon];

    previousIcon.classList.remove("enter");
    previousIcon.classList.add("exit");

    window.setTimeout(() => {

      previousIcon.classList.remove("exit");
      currentLoaderIcon =
        (currentLoaderIcon + 1) % loaderIcons.length;

      loaderIcons[currentLoaderIcon].classList.add("enter");

    }, 36);

  }

  if (loaderIcons.length > 0) {

    loaderIcons[0].classList.add("enter");

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      loaderInterval =
        window.setInterval(showNextLoaderIcon, 250);
    }

  }

  const minimumLoaderTime = 760;
  const maximumLoaderTime = 2160;
  const loaderStartedAt = performance.now();
  let pageResourcesReady =
    document.readyState === "complete";

  let minimumLoaderTimer;
  let maximumLoaderTimer;

  function hideLoadingScreen() {

    if (intro && !intro.classList.contains("hide")) {

      intro.classList.add("hide");
      window.clearInterval(loaderInterval);

      window.setTimeout(() => {
        document.body.classList.remove("loading");
      }, 400);

    }

    window.clearTimeout(minimumLoaderTimer);
    window.clearTimeout(maximumLoaderTimer);

  }

  function finishLoadingWhenReady() {

    if (
      pageResourcesReady &&
      performance.now() - loaderStartedAt >= minimumLoaderTime
    ) {
      hideLoadingScreen();
    }

  }

  window.addEventListener("load", () => {

    pageResourcesReady = true;
    finishLoadingWhenReady();

  }, { once: true });

  minimumLoaderTimer =
    window.setTimeout(finishLoadingWhenReady, minimumLoaderTime);

  maximumLoaderTimer =
    window.setTimeout(hideLoadingScreen, maximumLoaderTime);


  /* =========================================
     NAVBAR + SCROLL PROGRESS
  ========================================== */

  function updateScroll() {

    if (navbar) {

      navbar.classList.toggle(
        "scrolled",
        window.scrollY > 35
      );

    }


    const documentHeight =
      document.documentElement.scrollHeight;

    const viewportHeight =
      window.innerHeight;

    const maximumScroll =
      documentHeight - viewportHeight;


    if (maximumScroll > 0) {

      const percentage =
        (window.scrollY / maximumScroll) * 100;

      progress.style.width =
        percentage + "%";

    }

  }


  window.addEventListener(
    "scroll",
    updateScroll,
    {
      passive: true
    }
  );


  updateScroll();

  /* =========================================
     MOBILE MENU
  ========================================== */

  function setMobileMenuOpen(isOpen) {

    navLinks.classList.toggle("open", isOpen);
    menuBackdrop.classList.toggle("open", isOpen);
    navbar.classList.toggle("menu-open", isOpen);
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );

  }

  if (menuBtn && navLinks && menuBackdrop && navbar) {

    menuBtn.addEventListener("click", () => {
      setMobileMenuOpen(!navLinks.classList.contains("open"));
    });

    menuBackdrop.addEventListener("click", () => {
      setMobileMenuOpen(false);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && navLinks.classList.contains("open")) {
        setMobileMenuOpen(false);
        menuBtn.focus();
      }
    });

  }


  document
    .querySelectorAll(".nav-links a")
    .forEach(link => {

      link.addEventListener(
        "click",
        () => {

          setMobileMenuOpen(false);

        }
      );

    });


  /* =========================================
     CURSOR LIGHT
  ========================================== */

  window.addEventListener(
    "mousemove",
    event => {

      if (!cursorGlow) return;


      cursorGlow.style.left =
        event.clientX + "px";


      cursorGlow.style.top =
        event.clientY + "px";


      cursorGlow.style.opacity =
        "1";

    }
  );


  window.addEventListener(
    "mouseleave",
    () => {

      if (cursorGlow) {

        cursorGlow.style.opacity =
          "0";

      }

    }
  );


  /* =========================================
     SERVICE TABS
  ========================================== */

  document
    .querySelectorAll(".service-tab[data-target]")
    .forEach(tab => {

      tab.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(".service-tab[data-target]")
            .forEach(item => {

              item.classList.remove(
                "active"
              );

            });


          tab.classList.add(
            "active"
          );


          const targetID =
            tab.dataset.target;


          const target =
            document.getElementById(
              targetID
            );


          if (target) {

            target.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });

          }

        }
      );

    });


  /* =========================================
     SCROLL REVEAL
  ========================================== */

  const revealObserver =
    new IntersectionObserver(
      (entries, observer) => {

        entries.forEach(entry => {

          if (
            entry.isIntersecting
          ) {

            entry.target.classList.add(
              "visible"
            );


            observer.unobserve(
              entry.target
            );

          }

        });

      },
      {
        threshold: 0.12
      }
    );


  document
    .querySelectorAll(
      ".reveal, .reveal-left, .reveal-right"
    )
    .forEach(element => {

      revealObserver.observe(
        element
      );

    });


  /* =========================================
     STAGGER ANIMATIONS
  ========================================== */

  document
    .querySelectorAll(
      ".cards-grid, .compact-grid, .destination-row, .contact-grid"
    )
    .forEach(group => {

      [
        ...group.children
      ].forEach(
        (item, index) => {

          item.style.transitionDelay =
            Math.min(
              index * 70,
              350
            ) + "ms";

        }
      );

    });


  /* =========================================
     MAGNETIC BUTTONS
  ========================================== */

  document
    .querySelectorAll(".magnetic")
    .forEach(button => {

      button.addEventListener(
        "mousemove",
        event => {

          if (window.matchMedia("(pointer: coarse)").matches) {
            return;
          }


          const rect =
            button.getBoundingClientRect();


          const x =
            (
              event.clientX -
              rect.left -
              rect.width / 2
            ) * 0.12;


          const y =
            (
              event.clientY -
              rect.top -
              rect.height / 2
            ) * 0.12;


          button.style.transform =
            `translate(${x}px, ${y}px)`;

        }
      );


      button.addEventListener(
        "mouseleave",
        () => {

          button.style.transform =
            "";

        }
      );

    });


  /* =========================================
     BOOKING CONTENT
  ========================================== */

  const bookingCopy = {

    general: {

      title:
        "Tell us what you need.",

      sub:
        "Choose a service and we'll help you take the next step."

    },


    instant: {

      title:
        "Book in minutes — Just ₹1,499/-",

      sub:
        "10-Min Quick Shoot at your doorstep. Delivered in 24 hours."

    },


    wedding: {

      title:
        "Plan your wedding shoot.",

      sub:
        "Share your dates and events. We'll help shape the coverage."

    },


    prewedding: {

      title:
        "Let's plan your pre-wedding.",

      sub:
        "Tell us your preferred date, location and creative direction."

    },


    event: {

      title:
        "Cover my event.",

      sub:
        "Birthday, party, engagement or celebration — tell us the details."

    },


    commercial: {

      title:
        "Start a commercial project.",

      sub:
        "Share your brand, project type, location and timeline."

    },


    portrait: {

      title:
        "Book a portrait session.",

      sub:
        "At home, outdoors or at your preferred location."

    },


    salon: {

      title:
        "Book salon at home.",

      sub:
        "Tell us your location, preferred time and the services you need."

    },


    travel: {

      title:
        "Plan my trip.",

      sub:
        "Tell us your destination, dates and travel preferences."

    }

  };


  /* =========================================
     OPEN MODAL
  ========================================== */

  function openModal(type) {

    const copy =
      bookingCopy[type]
      ||
      bookingCopy.general;


    modalTitle.textContent =
      copy.title;


    modalSub.textContent =
      copy.sub;


    serviceType.value =
      type;


    modal.classList.add(
      "open"
    );


    modal.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.classList.add(
      "locked"
    );


    setTimeout(
      () => {

        const input =
          modal.querySelector(
            "input[name='name']"
          );


        if (input) {

          input.focus();

        }

      },
      350
    );

  }


  /* =========================================
     CLOSE MODAL
  ========================================== */

  function closeModal() {

    modal.classList.remove(
      "open"
    );


    modal.setAttribute(
      "aria-hidden",
      "true"
    );


    document.body.classList.remove(
      "locked"
    );

  }


  /* =========================================
     BOOKING BUTTONS
  ========================================== */

  const photographerBookingTypes = new Set([
    "instant",
    "wedding",
    "prewedding",
    "event",
    "commercial",
    "portrait"
  ]);
  const travelBookingTypes = new Set([
    "travel"
  ]);
  const salonBookingTypes = new Set([
    "salon"
  ]);

  const photographerEventMap = {
    wedding: "wedding",
    prewedding: "prewedding",
    instant: "instant",
    event: "party",
    commercial: "commercial",
    portrait: "instant"
  };

  function triggerBooking(bookingType, eventOverride) {
    if (photographerBookingTypes.has(bookingType)) {
      const eventTarget = eventOverride || photographerEventMap[bookingType] || bookingType;
      window.location.href = `PHOTOGRAPHER-BOOKING.HTML?event=${encodeURIComponent(eventTarget)}`;
      return;
    }

    if (travelBookingTypes.has(bookingType)) {
      const travelParam = eventOverride ? `?event=${encodeURIComponent(eventOverride)}` : "";
      window.location.href = `TRAVEL-BOOKING.HTML${travelParam}`;
      return;
    }

    if (salonBookingTypes.has(bookingType)) {
      const salonParam = eventOverride ? `?event=${encodeURIComponent(eventOverride)}` : "";
      window.location.href = `SALON-BOOKING.HTML${salonParam}`;
      return;
    }

    openModal(bookingType);
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-open-booking]");
    if (!trigger) return;
    e.preventDefault();
    const bookingType = trigger.dataset.openBooking;
    const eventOverride = trigger.dataset.event;
    triggerBooking(bookingType, eventOverride);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const trigger = e.target.closest("[data-open-booking]");
    if (!trigger) return;
    if (trigger.tagName !== "BUTTON" && trigger.tagName !== "A") {
      e.preventDefault();
      const bookingType = trigger.dataset.openBooking;
      const eventOverride = trigger.dataset.event;
      triggerBooking(bookingType, eventOverride);
    }
  });


  /* =========================================
     MODAL CLOSE BUTTONS
  ========================================== */

  document
    .querySelectorAll(
      "[data-close-modal]"
    )
    .forEach(element => {

      element.addEventListener(
        "click",
        closeModal
      );

    });


  /* =========================================
     ESC KEY
  ========================================== */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        modal.classList.contains("open")
      ) {

        closeModal();

      }

    }
  );


  /* =========================================
     WHATSAPP BOOKING
  ========================================== */

  if (form) {

    form.addEventListener(
      "submit",
      async event => {

        event.preventDefault();


        const data =
          new FormData(form);


        const type =
          data.get("service")
          ||
          "general";


        const prettyNames = {

          general:
            "General enquiry",

          instant:
            "Instant Photographer",

          wedding:
            "Wedding Photography",

          prewedding:
            "Pre-Wedding",

          event:
            "Event / Birthday",

          commercial:
            "Commercial Photography",

          portrait:
            "Portrait Session",

          salon:
            "Salon at Home",

          travel:
            "Travel Planning"

        };


        let refCode = "";

        if (window.SweepSageAPI) {
          if (toast) {
            toast.textContent = "Saving your enquiry…";
            toast.classList.add("show");
          }
          try {
            const res = await window.SweepSageAPI.createBooking({
              service: type,
              customer_name: data.get("name") || "Website Visitor",
              customer_phone: data.get("phone") || "Not provided",
              location: data.get("location") || "",
              booking_date: data.get("date") || "",
              booking_time: data.get("time") || "",
              notes: data.get("message") || ""
            });
            if (res && res.reference) {
              refCode = res.reference;
            }
          } catch (err) {
            console.warn("Backend booking submission note:", err);
          }
        }


        const messageLines = [

          "Hello SweepSage!",

          ""

        ];

        if (refCode) {
          messageLines.push(`Reference: ${refCode}`);
        }

        messageLines.push(
          `I want to enquire about: ${
            prettyNames[type] || type
          }`,

          `Name: ${
            data.get("name") || ""
          }`,

          `Phone: ${
            data.get("phone") || ""
          }`,

          `Location: ${
            data.get("location") || ""
          }`,

          `Date: ${
            data.get("date") ||
            "Not specified"
          }`,

          `Time: ${
            data.get("time") ||
            "Not specified"
          }`,

          `Details: ${
            data.get("message") ||
            "Not specified"
          }`
        );

        const message = messageLines.join("\n");


        /*
          SWEEPSAGE WHATSAPP NUMBER

          +91 9555826615

          WhatsApp format:
          91 + number
        */

        const whatsappNumber =
          "919555826615";


        const whatsappURL =
          `https://wa.me/${whatsappNumber}?text=${
            encodeURIComponent(message)
          }`;


        closeModal();


        if (toast) {

          toast.textContent =
            refCode ? `Enquiry #${refCode} saved! Opening WhatsApp…` : "Opening WhatsApp…";

          toast.classList.add(
            "show"
          );

        }


        setTimeout(
          () => {

            window.open(
              whatsappURL,
              "_blank"
            );


            if (toast) {

              toast.classList.remove(
                "show"
              );

            }


            form.reset();

          },
          450
        );

      }
    );

  }


  /* =========================================
     IMAGE PARALLAX
  ========================================== */

  const parallaxCards =
    document.querySelectorAll(
      ".image-card, .destination-card"
    );


  window.addEventListener(
    "scroll",
    () => {

      const viewport =
        window.innerHeight;


      parallaxCards.forEach(
        card => {

          const rect =
            card.getBoundingClientRect();


          if (
            rect.bottom < 0 ||
            rect.top > viewport
          ) {

            return;

          }


          const center =
            rect.top +
            rect.height / 2;


          const distance =
            (
              center -
              viewport / 2
            ) / viewport;


          card.style.backgroundPosition =
            `center ${
              50 + distance * -5
            }%`;

        }
      );

    },
    {
      passive: true
    }
  );


  /* =========================================
     SMOOTH ANCHOR LINKS
  ========================================== */

  document
    .querySelectorAll(
      "a[href^='#']"
    )
    .forEach(link => {

      link.addEventListener(
        "click",
        event => {

          const id =
            link.getAttribute("href");


          if (
            !id ||
            id === "#"
          ) {

            return;

          }


          const target =
            document.querySelector(id);


          if (!target) {

            return;

          }


          event.preventDefault();


          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      );
    });

  /* =========================================
     SWEEPSAGE THEME & SETTINGS MANAGER
  ========================================== */
  function initTheme() {
    try {
      localStorage.removeItem("sweepsage_theme");
    } catch (e) {}

    function applyTheme() {
      document.body.classList.remove("dark-theme");
      document.documentElement.setAttribute("data-theme", "light");
      if (document.documentElement.classList) {
        document.documentElement.classList.remove("dark-theme");
      }

      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute("content", "#ffffff");
      }
      let metaScheme = document.querySelector('meta[name="color-scheme"]');
      if (!metaScheme) {
        metaScheme = document.createElement("meta");
        metaScheme.setAttribute("name", "color-scheme");
        document.head.appendChild(metaScheme);
      }
      metaScheme.setAttribute("content", "light");
    }

    // Expose globally for backward compatibility
    window.applySweepSageTheme = function() {
      applyTheme();
    };

    window.toggleSweepSageTheme = function() {
      applyTheme();
    };

    // Permanently apply Light mode
    applyTheme();
  }

  /* =========================================
     SWEEPSAGE SETTINGS MODAL
  ========================================== */
  function initSettingsModal() {
    const modal = document.getElementById("settingsModal");
    if (!modal) return;

    function openSettings() {
      // Ensure the active theme is synced
      const currentTheme = localStorage.getItem("sweepsage_theme") === "dark" ? "dark" : "light";
      if (typeof window.applySweepSageTheme === "function") {
        window.applySweepSageTheme(currentTheme);
      }
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeSettings() {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    document.addEventListener("click", event => {
      const openTrigger = event.target.closest("[data-open-settings], #openSettingsBtn, #mobileSettingsBtn, .open-settings-trigger");
      if (openTrigger) {
        event.preventDefault();
        openSettings();
        return;
      }

      const closeTrigger = event.target.closest("[data-close-settings], #closeSettingsModalBtn, #settingsModalBackdrop, #saveCloseSettingsBtn");
      if (closeTrigger) {
        event.preventDefault();
        closeSettings();
        return;
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && modal.classList.contains("show")) {
        closeSettings();
      }
    });
  }

  initTheme();
  initSettingsModal();
  initDeliveryLocation();
  highlightActiveDock();
  initUserDropdown();

});

/* =========================================================
   NAVBAR LOCATION & GLOBAL MODAL CONTROLLERS
========================================================= */
/* =========================================================
   NAVBAR LOCATION & OPERATIONAL CITY CONTROLLERS
   Operational Cities strictly: Delhi, Noida, Ghaziabad, Lucknow, Gorakhpur
========================================================= */
const OPERATIONAL_CITIES = [
  {
    id: 'delhi',
    name: 'Delhi NCR',
    keywords: ['delhi', 'delhi ncr', 'new delhi', 'south delhi', 'west delhi', 'east delhi', 'north delhi', 'dwarka', 'connaught place', 'rohini', 'saket', 'gurgaon', 'gurugram']
  },
  {
    id: 'noida',
    name: 'Noida',
    keywords: ['noida', 'greater noida', 'sector 18', 'sector 62', 'sector 137', 'greaternoida', 'noida extension', 'knowledge park']
  },
  {
    id: 'ghaziabad',
    name: 'Ghaziabad',
    keywords: ['ghaziabad', 'indirapuram', 'vaishali', 'vasundhara', 'raj nagar', 'crossings republik', 'kaushambi', 'sahibabad']
  },
  {
    id: 'lucknow',
    name: 'Lucknow',
    keywords: ['lucknow', 'gomti nagar', 'hazratganj', 'aliganj', 'indira nagar', 'charbagh', 'mahanagar', 'ashiyana', 'aminabad']
  },
  {
    id: 'gorakhpur',
    name: 'Gorakhpur',
    keywords: ['gorakhpur', 'taramandal', 'golghar', 'gida', 'medical road', 'railway colony', 'asuran', 'shastripuram', 'mohadipur', 'bichhiya', 'padri bazar']
  }
];

function findOperationalCity(query) {
  if (!query) return null;
  const q = String(query).toLowerCase().trim();
  for (const city of OPERATIONAL_CITIES) {
    if (city.name.toLowerCase() === q || city.id === q) return city;
    if (city.keywords.some(k => q.includes(k) || k.includes(q))) return city;
  }
  return null;
}

function initDeliveryLocation() {
  const saved = localStorage.getItem('sweepsage_delivery_location');
  if (saved) {
    const targets = document.querySelectorAll('#navDeliveryLocation, .nav-delivery-location-text');
    targets.forEach(el => el.textContent = saved);
  }
}

window.openLocationModal = function() {
  const modal = document.getElementById('locationModal');
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    const notice = document.getElementById('locationUnavailNotice');
    if (notice) notice.style.display = 'none';
    const input = modal.querySelector('#locationSearchInput, input');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 100);
    }
  }
};

window.closeLocationModal = function() {
  const modal = document.getElementById('locationModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
};

window.showLocationUnavailableNotice = function(searchedLocation) {
  const notice = document.getElementById('locationUnavailNotice');
  const textEl = document.getElementById('locationUnavailText');
  const locName = searchedLocation ? `"${searchedLocation}"` : 'this location';
  
  if (textEl) {
    textEl.innerHTML = `We are not available in <strong>${locName}</strong> yet.<br>SweepSage is currently operational only in <strong>Delhi NCR, Noida, Ghaziabad, Lucknow</strong>, and <strong>Gorakhpur</strong>. We are launching in your area soon!`;
  }
  if (notice) {
    notice.style.display = 'flex';
    notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  
  const toastMsg = `⚠️ Currently not available in ${searchedLocation || 'this location'}! Available in Delhi NCR, Noida, Ghaziabad, Lucknow & Gorakhpur.`;
  if (typeof window.showSweepSageToast === 'function') {
    window.showSweepSageToast(toastMsg);
  } else {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = toastMsg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4000);
    }
  }
};

window.handleUnavailableCityClick = function(cityName) {
  window.showLocationUnavailableNotice(cityName);
};

window.handleCitySearchSubmit = function(query) {
  if (!query || !query.trim()) return;
  const matched = findOperationalCity(query);
  if (matched) {
    window.selectCity(matched.name, true);
  } else {
    window.showLocationUnavailableNotice(query);
  }
};

window.selectCity = function(cityName, skipValidation) {
  if (!cityName) return;
  const matched = findOperationalCity(cityName);
  if (!matched && !skipValidation) {
    window.showLocationUnavailableNotice(cityName);
    return;
  }

  const finalCityName = matched ? matched.name : cityName;
  localStorage.setItem('sweepsage_delivery_location', finalCityName);
  const targets = document.querySelectorAll('#navDeliveryLocation, .nav-delivery-location-text');
  targets.forEach(el => el.textContent = finalCityName);
  
  const notice = document.getElementById('locationUnavailNotice');
  if (notice) notice.style.display = 'none';

  window.closeLocationModal();
  if (typeof window.showSweepSageToast === 'function') {
    window.showSweepSageToast(`📍 Delivery location set to ${finalCityName}`);
  } else {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = `📍 Delivery location set to ${finalCityName}`;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }
  }
};

window.useGpsLocation = function() {
  const btn = document.querySelector('.location-gps-btn');
  const originalText = btn ? btn.innerHTML : '';
  if (btn) btn.innerHTML = '<span>⏳ Detecting GPS location…</span>';

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.selectCity('Noida, UP (GPS Detected)', true);
        if (btn) btn.innerHTML = originalText;
      },
      (err) => {
        window.selectCity('Delhi NCR (GPS Default)', true);
        if (btn) btn.innerHTML = originalText;
      },
      { timeout: 4000 }
    );
  } else {
    window.selectCity('Delhi NCR (GPS Default)', true);
    if (btn) btn.innerHTML = originalText;
  }
};

window.filterCities = function(query) {
  const q = (query || '').toLowerCase().trim();
  const notice = document.getElementById('locationUnavailNotice');
  const availablePills = document.querySelectorAll('#availableCitiesGrid .city-pill-btn');
  const otherPills = document.querySelectorAll('.other-cities-grid .city-pill-btn');
  
  if (!q) {
    if (notice) notice.style.display = 'none';
    availablePills.forEach(pill => pill.style.display = '');
    otherPills.forEach(pill => pill.style.display = '');
    return;
  }

  const matchedOpCity = findOperationalCity(q);

  if (matchedOpCity) {
    availablePills.forEach(pill => {
      const text = pill.textContent.toLowerCase();
      const matched = text.includes(matchedOpCity.name.toLowerCase()) || text.includes(matchedOpCity.id);
      pill.style.display = matched ? '' : 'none';
    });
    otherPills.forEach(pill => pill.style.display = 'none');
    if (notice) notice.style.display = 'none';
  } else {
    availablePills.forEach(pill => pill.style.display = 'none');
    otherPills.forEach(pill => {
      const text = pill.textContent.toLowerCase();
      pill.style.display = text.includes(q) ? '' : 'none';
    });
    if (q.length >= 2) {
      window.showLocationUnavailableNotice(query);
    }
  }
};

/* =========================================================
   GET THE APP MODAL
========================================================= */
window.openGetAppModal = function() {
  const modal = document.getElementById('getAppModal');
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
};

window.closeGetAppModal = function() {
  const modal = document.getElementById('getAppModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
};

/* =========================================================
   USER DROPDOWN & SUBPARTS MODALS
   [Profile] [Orders] [Favourites] Logout
========================================================= */
function initUserDropdown() {
  const trigger = document.getElementById('userMenuTrigger');
  const dropdown = document.getElementById('userMenuDropdown');
  if (!trigger || !dropdown) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
    const isOpen = dropdown.classList.contains('open');
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
}

window.openUserProfileModal = function() {
  const modal = document.getElementById('profileModal');
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
  const dd = document.getElementById('userMenuDropdown');
  if (dd) dd.classList.remove('open');
};

window.closeUserProfileModal = function() {
  const modal = document.getElementById('profileModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
};

window.openUserOrdersModal = function() {
  const modal = document.getElementById('ordersModal');
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
  const dd = document.getElementById('userMenuDropdown');
  if (dd) dd.classList.remove('open');
};

window.closeUserOrdersModal = function() {
  const modal = document.getElementById('ordersModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
};

window.openUserFavouritesModal = function() {
  const modal = document.getElementById('favouritesModal');
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
  const dd = document.getElementById('userMenuDropdown');
  if (dd) dd.classList.remove('open');
};

window.closeUserFavouritesModal = function() {
  const modal = document.getElementById('favouritesModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
};

window.showSweepSageToast = function(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
};

window.handleUserLogout = function() {
  const dd = document.getElementById('userMenuDropdown');
  if (dd) dd.classList.remove('open');
  localStorage.removeItem('sweepsage_user_auth');
  const loginText = document.getElementById('navLoginBtnText');
  if (loginText) loginText.textContent = 'Login';
  window.showSweepSageToast('👋 Logged out successfully.');
};

/* =========================================================
   PERSISTENT DOCK ACTIVE STATE HIGHLIGHT
========================================================= */
function highlightActiveDock() {
  const path = window.location.pathname.toLowerCase();
  const dockButtons = document.querySelectorAll('.service-dock-btn');
  dockButtons.forEach(btn => {
    const dockType = btn.dataset.dock;
    if (dockType && path.includes(dockType)) {
      btn.classList.add('active');
    } else if (dockType && path.endsWith('/') && dockType === 'home') {
      btn.classList.add('active');
    }
  });
}

// Global modal backdrop close & Escape key handler
document.addEventListener('click', (e) => {
  if (e.target.classList && e.target.classList.contains('custom-modal-backdrop')) {
    e.target.classList.remove('open');
    e.target.setAttribute('aria-hidden', 'true');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.custom-modal-backdrop.open').forEach(m => {
      m.classList.remove('open');
      m.setAttribute('aria-hidden', 'true');
    });
  }
});

/* =========================================================
   SMART BACK NAVIGATION & HISTORY TRACKING
========================================================= */
window.smartGoBack = function() {
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
};

try {
  const cur = window.location.href;
  const last = sessionStorage.getItem('sweepsage_last_url');
  if (last && last !== cur) {
    sessionStorage.setItem('sweepsage_prev_page', last);
  }
  sessionStorage.setItem('sweepsage_last_url', cur);
} catch(e) {}

/* =========================================================
   UNIVERSAL SEARCH MODAL & ENGINE
========================================================= */
const SEARCH_ICONS = {
  instant: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  photography: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
  salon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`,
  travel: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  partners: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  search: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`
};

const SEARCH_INDEX = [
  {
    id: "instant-photo",
    category: "instant",
    title: "10-Min Instant Photographer",
    sub: "Doorstep portrait, candid or reels in 10 minutes",
    price: "₹1,499/-",
    url: "PHOTOGRAPHER-BOOKING.HTML?event=instant"
  },
  {
    id: "wedding-photo",
    category: "photography",
    title: "Wedding Photography & Cinema",
    sub: "Full-day candid coverage, drone reels & cinematic teaser",
    price: "From ₹45,000/-",
    url: "PHOTOGRAPHER-BOOKING.HTML?event=wedding"
  },
  {
    id: "prewedding-photo",
    category: "photography",
    title: "Pre-Wedding Shoot & Story",
    sub: "Scenic outdoor romantic storytelling & reels",
    price: "From ₹25,000/-",
    url: "PHOTOGRAPHER-BOOKING.HTML?event=pre-wedding"
  },
  {
    id: "maternity-photo",
    category: "photography",
    title: "Maternity & Newborn Baby Shoot",
    sub: "Comfortable doorstep or studio maternity portraits",
    price: "From ₹12,000/-",
    url: "PHOTOGRAPHER-BOOKING.HTML?event=maternity"
  },
  {
    id: "fashion-photo",
    category: "photography",
    title: "Fashion & Commercial Portfolio",
    sub: "Studio lookbook, model test shoots & brand editorial",
    price: "From ₹15,000/-",
    url: "PHOTOGRAPHER-BOOKING.HTML?event=fashion"
  },
  {
    id: "event-photo",
    category: "photography",
    title: "Birthday & Corporate Event Coverage",
    sub: "Live event highlights, portraits & social reels",
    price: "From ₹8,500/-",
    url: "PHOTOGRAPHER-BOOKING.HTML?event=event"
  },
  {
    id: "bridal-salon",
    category: "salon",
    title: "Luxury HD Bridal Glam",
    sub: "Doorstep bridal makeup, airbrush, hair & draping",
    price: "From ₹18,500/-",
    url: "SALON-BOOKING.HTML?event=bridal"
  },
  {
    id: "party-salon",
    category: "salon",
    title: "Party & Cocktail Makeup Glam",
    sub: "Celebration-ready glow, lashes & hairstyling",
    price: "From ₹3,500/-",
    url: "SALON-BOOKING.HTML?event=party"
  },
  {
    id: "hair-salon",
    category: "salon",
    title: "Hair Spa, Keratin & Styling",
    sub: "Deep conditioning, haircut, blowdry & treatments",
    price: "From ₹1,800/-",
    url: "SALON-BOOKING.HTML?event=hair"
  },
  {
    id: "facial-salon",
    category: "salon",
    title: "Facial Glow & Organic Clean-up",
    sub: "O3+ facial, skin radiance & de-tan at home",
    price: "From ₹2,200/-",
    url: "SALON-BOOKING.HTML?event=facial"
  },
  {
    id: "groom-salon",
    category: "salon",
    title: "Men's Grooming & Beard Styling",
    sub: "Doorstep haircut, beard trim & relaxing head massage",
    price: "From ₹999/-",
    url: "SALON-BOOKING.HTML?event=groom"
  },
  {
    id: "kashmir-travel",
    category: "travel",
    title: "Kashmir Serenade Tour",
    sub: "Srinagar houseboat, Gulmarg gondola & Pahalgam valley",
    price: "From ₹65,000/-",
    url: "TRAVEL-BOOKING.HTML?event=kashmir"
  },
  {
    id: "goa-travel",
    category: "travel",
    title: "Goa Luxury Beach Escape",
    sub: "Private villa stays, coastal dining & catamaran cruises",
    price: "From ₹45,000/-",
    url: "TRAVEL-BOOKING.HTML?event=goa"
  },
  {
    id: "rajasthan-travel",
    category: "travel",
    title: "Rajasthan Royal Heritage",
    sub: "Udaipur palace stays, Jaipur bazaars & desert glamping",
    price: "From ₹75,000/-",
    url: "TRAVEL-BOOKING.HTML?event=rajasthan"
  },
  {
    id: "intl-travel",
    category: "travel",
    title: "Curated International Getaways",
    sub: "Bespoke itineraries for Bali, Maldives, Dubai & Europe",
    price: "Custom",
    url: "TRAVEL-BOOKING.HTML?event=international"
  },
  {
    id: "partners-directory",
    category: "partners",
    title: "Verified Partner Creators Directory",
    sub: "Explore verified photographers, videographers & makeup artists",
    price: "Explore",
    url: "partners.html"
  },
  {
    id: "partner-register",
    category: "partners",
    title: "Become a SweepSage Partner",
    sub: "Join our premium verified creator & stylist network",
    price: "Free Signup",
    url: "partner-register.html"
  }
];

let activeSearchCategory = "all";

function ensureSearchModalDOM() {
  if (document.getElementById("searchModal")) return;

  const modalHtml = `
  <div class="custom-modal-backdrop search-modal-backdrop" id="searchModal" aria-hidden="true" role="dialog" aria-modal="true">
    <div class="custom-modal-box">
      <button type="button" class="modal-close-cross" onclick="closeSearchModal()" aria-label="Close search">&times;</button>
      
      <div class="search-input-box">
        <span class="search-input-icon">${SEARCH_ICONS.search}</span>
        <input type="text" id="globalSearchInput" class="search-main-input" placeholder="Search photographers, salon services, trips, locations..." autocomplete="off">
        <button type="button" class="search-clear-btn" id="searchClearBtn" onclick="clearSearchInput()" aria-label="Clear">&times;</button>
        <span class="search-esc-badge">ESC</span>
      </div>

      <div class="search-categories-row" id="searchCategoryPills">
        <button type="button" class="search-cat-pill active" onclick="setSearchCategory('all', this)">All</button>
        <button type="button" class="search-cat-pill" onclick="setSearchCategory('instant', this)">${SEARCH_ICONS.instant} 10-Min Instant</button>
        <button type="button" class="search-cat-pill" onclick="setSearchCategory('photography', this)">${SEARCH_ICONS.photography} Photography</button>
        <button type="button" class="search-cat-pill" onclick="setSearchCategory('salon', this)">${SEARCH_ICONS.salon} Salon</button>
        <button type="button" class="search-cat-pill" onclick="setSearchCategory('travel', this)">${SEARCH_ICONS.travel} Travel</button>
        <button type="button" class="search-cat-pill" onclick="setSearchCategory('partners', this)">${SEARCH_ICONS.partners} Partners</button>
      </div>

      <div class="search-results-list" id="searchResultsList">
        <!-- populated dynamically -->
      </div>
    </div>
  </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);
  attachSearchEvents();
}

function attachSearchEvents() {
  const input = document.getElementById("globalSearchInput");
  const clearBtn = document.getElementById("searchClearBtn");
  if (!input) return;

  input.addEventListener("input", (e) => {
    const val = e.target.value.trim();
    if (clearBtn) clearBtn.style.display = val ? "block" : "none";
    renderSearchResults(val, activeSearchCategory);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const firstResult = document.querySelector("#searchResultsList .search-result-item");
      if (firstResult) {
        firstResult.click();
      }
    }
  });
}

window.openSearchModal = function() {
  ensureSearchModalDOM();
  const modal = document.getElementById("searchModal");
  if (modal) {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    const input = document.getElementById("globalSearchInput");
    if (input) {
      setTimeout(() => input.focus(), 80);
      renderSearchResults(input.value.trim(), activeSearchCategory);
    }
  }
};

window.closeSearchModal = function() {
  const modal = document.getElementById("searchModal");
  if (modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }
};

window.clearSearchInput = function() {
  const input = document.getElementById("globalSearchInput");
  const clearBtn = document.getElementById("searchClearBtn");
  if (input) {
    input.value = "";
    input.focus();
  }
  if (clearBtn) clearBtn.style.display = "none";
  renderSearchResults("", activeSearchCategory);
};

window.setSearchCategory = function(cat, btn) {
  activeSearchCategory = cat;
  document.querySelectorAll(".search-cat-pill").forEach(p => p.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const input = document.getElementById("globalSearchInput");
  renderSearchResults(input ? input.value.trim() : "", cat);
};

window.quickFillSearch = function(query) {
  const input = document.getElementById("globalSearchInput");
  const clearBtn = document.getElementById("searchClearBtn");
  if (input) {
    input.value = query;
    if (clearBtn) clearBtn.style.display = "block";
    renderSearchResults(query, "all");
    input.focus();
  }
};

function renderSearchResults(query, category) {
  const container = document.getElementById("searchResultsList");
  if (!container) return;

  const q = (query || "").toLowerCase();

  let filtered = SEARCH_INDEX.filter(item => {
    const matchesCategory = (category === "all" || item.category === category);
    if (!matchesCategory) return false;
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.sub.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.price && item.price.toLowerCase().includes(q))
    );
  });

  if (!q && (!filtered || filtered.length === 0 || category === "all")) {
    container.innerHTML = `
      <div class="search-empty-state">
        <strong style="color: #cbd5e1; font-size: 13.5px; display: block; margin-bottom: 4px;">Trending Experiences & Quick Bookings</strong>
        <p style="font-size: 12px; margin: 0; color: #64748b;">Instant doorstep services, luxury wedding crews, and curated trips.</p>
        <div class="search-trending-pills">
          <button type="button" class="search-trend-btn" onclick="quickFillSearch('10-Min Photographer')">10-Min Shoot</button>
          <button type="button" class="search-trend-btn" onclick="quickFillSearch('Bridal Makeup')">Bridal Glam</button>
          <button type="button" class="search-trend-btn" onclick="quickFillSearch('Kashmir')">Kashmir Tour</button>
          <button type="button" class="search-trend-btn" onclick="quickFillSearch('Wedding')">Wedding Cinema</button>
          <button type="button" class="search-trend-btn" onclick="quickFillSearch('Hair Spa')">Hair Spa</button>
          <button type="button" class="search-trend-btn" onclick="quickFillSearch('Goa')">Goa Escape</button>
        </div>
      </div>
    `;
    if (!q && category === "all") {
      filtered = SEARCH_INDEX.slice(0, 6);
      container.innerHTML += `
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin: 12px 0 6px 4px;">Suggested for You</div>
      ` + filtered.map(item => `
        <a href="${item.url}" class="search-result-item" onclick="closeSearchModal()">
          <div class="search-result-left">
            <div class="search-result-icon">${SEARCH_ICONS[item.category] || SEARCH_ICONS.search}</div>
            <div class="search-result-texts">
              <strong>${item.title}</strong>
              <small>${item.sub}</small>
            </div>
          </div>
          <div class="search-result-right">
            <span class="search-price-badge">${item.price}</span>
            <span class="search-arrow">→</span>
          </div>
        </a>
      `).join("");
    }
    return;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="search-empty-state">
        <div style="display:inline-flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); margin:0 auto 10px auto; color:#94a3b8;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <strong style="color: #cbd5e1; font-size: 14px; display: block;">No matching experiences found</strong>
        <p style="font-size: 12px; margin-top: 4px; color: #64748b;">Try searching for "Photographer", "Salon", "Bridal", or "Travel".</p>
        <div class="search-trending-pills">
          <button type="button" class="search-trend-btn" onclick="quickFillSearch('Photographer')">Photographer</button>
          <button type="button" class="search-trend-btn" onclick="quickFillSearch('Salon')">Salon</button>
          <button type="button" class="search-trend-btn" onclick="quickFillSearch('Travel')">Travel</button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <a href="${item.url}" class="search-result-item" onclick="closeSearchModal()">
      <div class="search-result-left">
        <div class="search-result-icon">${SEARCH_ICONS[item.category] || SEARCH_ICONS.search}</div>
        <div class="search-result-texts">
          <strong>${item.title}</strong>
          <small>${item.sub}</small>
        </div>
      </div>
      <div class="search-result-right">
        <span class="search-price-badge">${item.price}</span>
        <span class="search-arrow">→</span>
      </div>
    </a>
  `).join("");
}

// Global hotkey: Ctrl+K / Cmd+K or "/" to open search
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openSearchModal();
  } else if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
    e.preventDefault();
    openSearchModal();
  }
});