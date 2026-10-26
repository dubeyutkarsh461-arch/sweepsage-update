(function () {
  const STORAGE_KEYS = {
    partners: 'sweepsagePartnersData',
    session: 'sweepsagePartnerSession',
    userProfile: 'sweepsagePartnerProfile'
  };

  const CATEGORY_OPTIONS = [
    'All',
    'Photographer',
    'Videographer',
    'Makeup Artist',
    'Mehndi Artist',
    'Travel Guide',
    'Decorator',
    'Hairstylist',
    'Fashion Stylist',
    'Event Artist',
    'Other'
  ];

  const FAKE_PARTNER_SLUGS = new Set([
    'rahul-sharma', 'aisha-khan', 'nikhil-verma', 'sana-ali', 'arjun-mehta',
    'priya-nair', 'ananya-sen', 'kabir-mehta', 'rohan-kapoor', 'meera-joshi',
    'tenzin-norbu', 'vikram-rathore', 'maya-fernandez', 'karan-grover'
  ]);

  function isFakePartner(partner) {
    if (!partner) return false;
    const slug = (partner.slug || '').toLowerCase();
    const id = String(partner.id || '').toLowerCase();
    return FAKE_PARTNER_SLUGS.has(slug) || FAKE_PARTNER_SLUGS.has(id);
  }

  function createDefaultPartnerData() {
    return [];
  }

  function cleanupFakePartners() {
    if (!window.localStorage) return [];
    try {
      const current = localStorage.getItem(STORAGE_KEYS.partners);
      if (!current) return [];
      let parsed = JSON.parse(current);
      if (!Array.isArray(parsed)) return [];
      const cleaned = parsed.filter((p) => !isFakePartner(p));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.partners, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch (_e) {
      localStorage.removeItem(STORAGE_KEYS.partners);
      return [];
    }
  }

  function ensureDefaultData() {
    return cleanupFakePartners();
  }

  async function hashPassword(value) {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function getPartnerProfiles() {
    return ensureDefaultData();
  }

  function getActivePartner() {
    const session = localStorage.getItem(STORAGE_KEYS.session);
    if (!session) {
      return null;
    }

    try {
      const parsed = JSON.parse(session);
      const profiles = getPartnerProfiles();
      return profiles.find((partner) => partner.email === parsed.email) || null;
    } catch (_error) {
      return null;
    }
  }

  function getProfilePageHref(slug) {
    const path = window.location.pathname || '';
    const isInsidePartnersFolder = path.includes('/partners/') || path.endsWith('/partners/');
    const prefix = isInsidePartnersFolder ? '../' : '';
    return `${prefix}partner-profile.html?slug=${encodeURIComponent(slug)}`;
  }

  function formatProfessionList(partners) {
    return partners.filter(Boolean).map((partner) => partner.profession);
  }

  function getPartnersForGroup(groupName) {
    const all = getPartnerProfiles().filter((partner) => partner.status === 'APPROVED');
    if (groupName === 'photography') {
      return all.filter((partner) => ['Photographer', 'Videographer', 'Cinematographer'].includes(partner.profession));
    }
    if (groupName === 'salon') {
      return all.filter((partner) => ['Makeup Artist', 'Mehndi Artist', 'Hairstylist', 'Salon Specialist', 'Skin Therapist', 'Fashion Stylist'].includes(partner.profession));
    }
    if (groupName === 'travel') {
      return all.filter((partner) => ['Travel Guide', 'Tour Guide', 'Trip Curator'].includes(partner.profession));
    }
    return all;
  }

  function observeReveals(container) {
    if (!container) return;
    const items = container.querySelectorAll('.reveal:not(.visible)');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    items.forEach((item) => observer.observe(item));
  }

  function renderCardHtml(partner, isDark = false) {
    const profileHref = getProfilePageHref(partner.slug);
    const darkClass = isDark ? 'partner-card-dark' : '';
    const badgeText = escapeHtml(partner.profession || 'Partner');
    const locationText = escapeHtml(partner.location || 'India');
    const nameText = escapeHtml(partner.name || '');
    const bioText = escapeHtml(partner.bio || '');
    const ratingVal = partner.rating ? Number(partner.rating).toFixed(1) : '4.9';
    const countVal = partner.portfolioCount ? `${partner.portfolioCount} Works` : 'Verified';
    const profileImg = partner.profileImage || partner.profile_image || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80';

    return `
      <article class="partner-card ${darkClass} reveal" data-slug="${escapeHtml(partner.slug)}">
        <div class="partner-card-media">
          <img src="${escapeHtml(profileImg)}" alt="${nameText}" loading="lazy">
          <div class="partner-media-gradient"></div>
          <div class="partner-badges">
            <span class="partner-chip">${badgeText}</span>
            <span class="partner-rating-badge">
              <svg class="star-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span>${ratingVal}</span>
            </span>
          </div>
        </div>
        <div class="partner-card-body">
          <div class="partner-card-title-row">
            <h3 class="partner-name">
              <a href="${profileHref}">${nameText}</a>
              <span class="verified-tick" title="Verified Partner">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </span>
            </h3>
          </div>
          <div class="partner-meta-row">
            <span class="partner-location">
              <svg viewBox="0 0 20 20" fill="currentColor" class="pin-icon">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              ${locationText}
            </span>
            <span class="partner-count-tag">${countVal}</span>
          </div>
          <p class="partner-bio">${bioText}</p>
          <div class="partner-card-footer">
            <span class="partner-avail-badge">
              <span class="pulse-dot"></span>
              <span>Available</span>
            </span>
            <div class="partner-card-actions">
              <button type="button" class="partner-share-btn" data-share-slug="${escapeHtml(partner.slug)}" data-share-name="${nameText}" data-share-role="${badgeText}" data-share-img="${escapeHtml(profileImg)}" aria-label="Share ${nameText}'s profile" title="Share Profile">
                <svg class="share-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                <span class="share-btn-text">Share</span>
              </button>
              <a class="partner-card-cta view-profile-btn" href="${profileHref}" title="View ${nameText}'s profile">
                <span>View Profile</span>
                <span class="cta-arrow">↗</span>
              </a>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  // Handle 1-click URL approval parameter if opened directly in browser
  function checkUrlApprovalAction() {
    const params = new URLSearchParams(window.location.search);
    const approveId = params.get('approve_id') || (params.get('action') === 'approve' ? params.get('id') : null);
    const approveSlug = params.get('approve_slug');
    if (approveId || approveSlug) {
      const all = getPartnerProfiles();
      const target = all.find(p => (approveId && String(p.id) === String(approveId)) || (approveSlug && p.slug === approveSlug));
      if (target) {
        target.status = 'APPROVED';
        localStorage.setItem(STORAGE_KEYS.partners, JSON.stringify(all));
        if (window.SweepSageAPI && target.id && typeof target.id === 'number') {
          window.SweepSageAPI.updatePartnerApproval(target.id, 'APPROVED').catch(() => {});
        }
        showToast(`Partner ${target.name} has been APPROVED! Profile is now live.`);
      }
    }
  }

  function renderServiceMount(mountId, groupName, eyebrow, title, desc, filterParam) {
    const mount = document.getElementById(mountId);
    if (!mount) return;

    const pool = getPartnersForGroup(groupName);
    if (!pool || !pool.length) {
      mount.innerHTML = '';
      return;
    }

    const isDark = groupName === 'salon';
    const darkSectionClass = isDark ? 'dark-section' : '';
    const darkGridClass = isDark ? 'dark-mode-grid' : '';
    const eyebrowClass = isDark ? 'eyebrow gold' : 'eyebrow dark';
    const linkClass = isDark ? 'text-link light-link' : 'text-link';

    mount.innerHTML = `
      <section class="service-partners-section ${groupName}-partners-wrap ${darkSectionClass}" id="${groupName}-partners">
        <div class="section-head reveal visible">
          <div>
            <span class="${eyebrowClass}">${escapeHtml(eyebrow)}</span>
            <h2>${title}</h2>
          </div>
          <div class="section-head-actions">
            <p>${escapeHtml(desc)}</p>
            <a class="${linkClass}" href="partners.html?filter=${encodeURIComponent(filterParam)}">View all ${escapeHtml(filterParam)}s <span>→</span></a>
          </div>
        </div>
        <div class="partners-grid compact-partners-grid ${darkGridClass}">
          ${pool.map((partner) => renderCardHtml(partner, isDark)).join('')}
        </div>
      </section>
    `;
    observeReveals(mount);
  }

  function renderPartnerGrid(container, filterValue, isDark = false) {
    if (!container) {
      return;
    }

    const group = container.dataset.partnerGroup;
    const pool = group ? getPartnersForGroup(group) : getPartnerProfiles().filter((partner) => partner.status === 'APPROVED');

    if (!pool.length) {
      container.innerHTML = `
        <div class="partner-empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 24px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.12); border-radius: 20px; margin: 20px 0;">
          <div style="font-size: 44px; margin-bottom: 14px;">🤝</div>
          <h3 style="font-size: 22px; font-weight: 800; margin-bottom: 10px; color: inherit;">No Partners Listed Yet</h3>
          <p style="font-size: 14.5px; opacity: 0.75; max-width: 480px; margin: 0 auto 24px; line-height: 1.6;">
            We only feature 100% verified professionals. New partner applications undergo team verification and WhatsApp approval before appearing live.
          </p>
          <a class="nav-cta" href="partner-register.html" style="display: inline-block; padding: 12px 28px; text-decoration: none; border-radius: 999px; font-weight: 700;">Become our first Partner ↗</a>
        </div>
      `;
      return;
    }

    const selected = filterValue || 'All';
    const visible = selected === 'All'
      ? pool
      : pool.filter((partner) => partner.profession === selected);

    if (!visible.length) {
      container.innerHTML = '<div class="partner-empty" style="grid-column: 1 / -1; text-align: center; padding: 32px 20px; color: #888;">No approved partners found in this category yet.</div>';
      return;
    }

    const dark = isDark || container.classList.contains('dark-mode-grid') || (container.closest && container.closest('.dark-section') !== null);
    container.innerHTML = visible.map((partner) => renderCardHtml(partner, dark)).join('');
    observeReveals(container);
  }

  function buildFilterButtons() {
    const filterBars = document.querySelectorAll('.partners-filter-bar');
    if (!filterBars.length) {
      return;
    }

    filterBars.forEach((filterBar) => {
      const container = filterBar.closest('.partners-section, .partners-page, main') || document;
      const grid = container.querySelector('#partnersGrid') || document.querySelector('#partnersGrid');
      if (!grid) {
        return;
      }

      const pool = getPartnerProfiles().filter((partner) => partner.status === 'APPROVED');
      if (!pool.length) {
        filterBar.style.display = 'none';
        return;
      }
      filterBar.style.display = '';

      let filterButtons = filterBar.querySelectorAll('.partner-filter-btn');
      if (!filterButtons.length) {
        const buttons = CATEGORY_OPTIONS.map((category) => `<button class="partner-filter-btn ${category === 'All' ? 'active' : ''}" type="button" data-partner-filter="${category}">${category}</button>`).join('');
        filterBar.innerHTML = buttons;
        filterButtons = filterBar.querySelectorAll('.partner-filter-btn');
      }

      const urlParams = new URLSearchParams(window.location.search);
      const paramFilter = urlParams.get('filter');
      const initialFilter = paramFilter && (CATEGORY_OPTIONS.includes(paramFilter) || Array.from(filterButtons).some((btn) => btn.dataset.partnerFilter === paramFilter))
        ? paramFilter
        : 'All';

      filterButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.partnerFilter === initialFilter);
        btn.onclick = () => {
          const selected = btn.dataset.partnerFilter;
          filterButtons.forEach((node) => node.classList.toggle('active', node === btn));
          renderPartnerGrid(grid, selected);
        };
      });

      renderPartnerGrid(grid, initialFilter);
    });
  }

  function initAllPartnerGrids() {
    function refreshGrids() {
      // 1. Dynamic service mounts (only rendered if approved partners exist)
      renderServiceMount(
        'salonPartnersMount',
        'salon',
        'DOORSTEP BEAUTY & WELLNESS',
        'Top Rated <span>Salon Specialists</span>',
        'Certified stylists, makeup artists, and grooming specialists delivering pampering at your doorstep.',
        'Makeup Artist'
      );

      renderServiceMount(
        'travelPartnersMount',
        'travel',
        'CURATED EXPEDITIONS & LOCAL EXPERTS',
        'Our Top Rated <span>Travel Guides</span>',
        'Handpicked mountain trek leaders, heritage curators, and personal itinerary guides for your journey.',
        'Travel Guide'
      );

      // 2. Main partners page (partners.html)
      const mainGrid = document.querySelector('#partnersGrid');
      if (mainGrid) {
        const activeBtn = document.querySelector('.partner-filter-btn.active');
        const filter = activeBtn ? activeBtn.dataset.partnerFilter : 'All';
        renderPartnerGrid(mainGrid, filter);
      }

      buildFilterButtons();
    }

    refreshGrids();
    checkUrlApprovalAction();

    // Fetch verified approved partners from backend API
    if (window.SweepSageAPI && typeof window.SweepSageAPI.getPublicPartners === 'function') {
      window.SweepSageAPI.getPublicPartners({ status: 'APPROVED' }).then((partners) => {
        if (Array.isArray(partners)) {
          const valid = partners.filter((p) => !isFakePartner(p));
          localStorage.setItem(STORAGE_KEYS.partners, JSON.stringify(valid));
          refreshGrids();
        }
      }).catch((err) => {
        console.warn('[SweepSage] Partner sync error:', err);
      });
    }
  }

  function escapeHtml(value) {
    if (value === undefined || value === null) {
      return '';
    }
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(message, type = 'success') {
    let toast = document.querySelector('#sweepsageToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sweepsageToast';
      toast.className = 'sweepsage-toast';
      document.body.appendChild(toast);
    }
    toast.className = `sweepsage-toast ${type === 'error' ? 'error' : ''}`;
    toast.innerHTML = `
      <span>${type === 'error' ? '⚠️' : '✨'}</span>
      <div>${escapeHtml(message)}</div>
    `;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }

  function isProfileOwner(partner) {
    if (!partner) return false;
    if (partner.is_owner === true) return true;
    const active = getActivePartner();
    if (!active) return false;
    if (active.id && partner.id && String(active.id) === String(partner.id)) return true;
    if (active.slug && partner.slug && String(active.slug).toLowerCase() === String(partner.slug).toLowerCase()) return true;
    if (active.email && partner.email && String(active.email).toLowerCase() === String(partner.email).toLowerCase()) return true;
    return false;
  }

  function updateNavbarAuthState() {
    const active = getActivePartner();
    const navLinks = document.querySelector('#mainNav');
    if (!navLinks) return;

    // Check if partner login link exists
    const loginLink = navLinks.querySelector('a[href*="partner-login"]');
    if (active && loginLink) {
      loginLink.outerHTML = `
        <a href="partner-profile.html?slug=${encodeURIComponent(active.slug)}" style="color: var(--logo-color, #fc5e68); font-weight: 700;">
          👤 ${escapeHtml(active.name.split(' ')[0])}
        </a>
      `;
    }
  }

  function renderPartnerProfile() {
    const container = document.querySelector('#partnerProfile');
    if (!container) {
      return;
    }

    updateNavbarAuthState();

    const params = new URLSearchParams(window.location.search);
    let slug = params.get('slug');
    let partnerId = params.get('id');

    if (!slug && !partnerId) {
      const active = getActivePartner();
      if (active && active.slug) {
        window.location.replace(`partner-profile.html?slug=${encodeURIComponent(active.slug)}`);
        return;
      }
      const all = getPartnerProfiles().filter(p => p.status === 'APPROVED');
      if (all && all.length && all[0].slug) {
        window.location.replace(`partner-profile.html?slug=${encodeURIComponent(all[0].slug)}`);
        return;
      }
      container.innerHTML = '<div class="partner-empty">No partners available yet.</div>';
      return;
    }

    const profiles = getPartnerProfiles();
    let partner = profiles.find((item) => (slug && item.slug === slug) || (partnerId && String(item.id) === String(partnerId)));

    if (!partner) {
      container.innerHTML = `
        <div class="partner-empty" style="padding: 60px 20px; text-align: center;">
          <h2>Partner Profile Not Found</h2>
          <p style="margin: 12px 0 24px; color: #666;">The partner creator you requested does not exist or may have been updated.</p>
          <a class="secondary-btn" href="partners.html">Browse Partner Directory <span>→</span></a>
        </div>
      `;
      return;
    }

    // Verify ownership
    const isOwner = isProfileOwner(partner);

    // If profile is not approved and visitor is not the owner, hide it
    if (partner.status !== 'APPROVED' && !isOwner) {
      container.innerHTML = `
        <div class="partner-empty" style="padding: 60px 20px; text-align: center;">
          <div style="font-size: 42px; margin-bottom: 12px;">⏳</div>
          <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">Profile Pending Approval</h2>
          <p style="margin: 12px auto 24px; max-width: 480px; color: #888; line-height: 1.5;">This partner application is currently undergoing admin verification via WhatsApp. Once approved by the team, the public profile will become live.</p>
          <a class="secondary-btn" href="partners.html">Browse Partner Directory <span>→</span></a>
        </div>
      `;
      return;
    }

    const currentTab = params.get('tab') || 'All';
    const allItems = Array.isArray(partner.portfolio) ? partner.portfolio : [];

    const photoCount = allItems.filter((i) => (i.type || '').toLowerCase() === 'photos').length;
    const videoCount = allItems.filter((i) => (i.type || '').toLowerCase() === 'videos').length;
    const reelCount = allItems.filter((i) => (i.type || '').toLowerCase() === 'reels').length;
    const eventCount = allItems.filter((i) => (i.type || '').toLowerCase() === 'events').length;

    const visiblePortfolio = currentTab === 'All'
      ? allItems
      : allItems.filter((item) => (item.type || '').toLowerCase() === currentTab.toLowerCase());

    const profileImg = partner.profileImage || partner.profile_image || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80';
    const socialObj = Object.assign({}, partner.social || {});
    if (!socialObj.instagram && partner.instagram) socialObj.instagram = partner.instagram;
    if (!socialObj.website && partner.website) socialObj.website = partner.website;

    const publicLinks = Object.entries(socialObj).map(([key, value]) => {
      const label = key === 'website' ? 'Website' : key.charAt(0).toUpperCase() + key.slice(1);
      return `<a class="social-link" href="${key === 'website' ? 'https://' + String(value).replace(/^https?:\/\//, '') : '#'}" target="${key === 'website' ? '_blank' : '_self'}" rel="noreferrer">${label}</a>`;
    }).join('');

    const tabButtons = [
      { key: 'All', label: `All (${allItems.length})` },
      { key: 'Photos', label: `Photos (${photoCount})` },
      { key: 'Videos', label: `Videos (${videoCount})` },
      { key: 'Reels', label: `Reels (${reelCount})` },
      { key: 'Events', label: `Events (${eventCount})` }
    ].map((tab) => `
      <button type="button" class="portfolio-tab ${tab.key.toLowerCase() === currentTab.toLowerCase() ? 'active' : ''}" data-portfolio-tab="${tab.key}">
        ${tab.label}
      </button>
    `).join('');

    // Owner Add Media Card
    const ownerAddCardMarkup = isOwner ? `
      <div class="gallery-add-card" id="openUploadMediaGridCard" title="Upload Photos or Videos to your profile">
        <div class="add-card-inner">
          <div class="add-icon-circle">+</div>
          <h3>Upload Work</h3>
          <p>Add new photos, cinematic videos, or reels</p>
          <span class="upload-badge">+ Photo / Video</span>
        </div>
      </div>
    ` : '';

    const portfolioMarkup = (visiblePortfolio.length || isOwner)
      ? `
        ${ownerAddCardMarkup}
        ${visiblePortfolio.map((item) => {
          const isVideo = item.mediaType === 'video' || item.media_type === 'video' || (item.src && item.src.match(/\.(mp4|webm|mov|m4v)$/i));
          const posterImg = item.poster || (isVideo ? item.src : '');
          return `
            <div class="gallery-item" data-id="${item.id}" data-label="${escapeHtml(item.type || 'Photos')}" data-media="${isVideo ? 'video' : 'image'}" data-src="${encodeURIComponent(item.src)}" data-title="${encodeURIComponent(item.title)}" data-poster="${encodeURIComponent(posterImg)}">
              ${isOwner ? `
                <button type="button" class="owner-delete-btn" data-delete-id="${item.id}" title="Delete this item from your profile">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              ` : ''}
              <div class="gallery-item-badges">
                <span class="gallery-tag-pill">${escapeHtml(item.type || 'Photos')}</span>
              </div>
              ${isVideo ? `
                <video src="${item.src}" poster="${posterImg}" muted playsinline preload="metadata"></video>
                <div class="gallery-video-indicator">
                  <svg width="12" height="12" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  <span>Video</span>
                </div>
              ` : `
                <img src="${item.src}" alt="${escapeHtml(item.title)}" loading="lazy">
              `}
            </div>
          `;
        }).join('')}
      `
      : '<div class="partner-empty">No portfolio items match this category yet.</div>';

    container.innerHTML = `
      ${isOwner ? `
        <div class="partner-owner-banner">
          <div class="owner-banner-left">
            <span class="owner-status-pill">
              <span class="pulse-dot"></span> Authenticated Owner Mode
            </span>
            <div class="owner-partner-meta">
              <strong>Logged in as ${escapeHtml(partner.name)}</strong>
              <span class="owner-id-tag">ID: #${escapeHtml(partner.id || partner.slug)}</span>
            </div>
            <p class="owner-security-note">🔒 Strict Authorization: Only you can upload media or edit this profile. Others have view-only access.</p>
          </div>
          <div class="owner-banner-actions">
            <button type="button" class="owner-cta-btn primary-upload-trigger" id="openUploadMediaBtn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              + Upload Photos / Videos
            </button>
            <button type="button" class="owner-cta-btn secondary-edit-trigger" id="openEditProfileBtn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Profile
            </button>
            <a href="partner-dashboard.html" class="owner-cta-btn ghost-dashboard-link">
              Dashboard ↗
            </a>
            <button type="button" class="owner-cta-btn logout-link" id="ownerLogoutBtn">
              Logout
            </button>
          </div>
        </div>
      ` : ''}

      <section class="profile-hero">
        <div class="profile-hero-grid">
          <div class="profile-photo">
            <img src="${profileImg}" alt="${escapeHtml(partner.name)}" loading="lazy">
            ${isOwner ? `
              <button type="button" class="owner-avatar-edit-chip" id="changeAvatarBtn" style="position: absolute; bottom: 16px; left: 16px; background: rgba(0,0,0,0.75); color: #fff; border: 1px solid rgba(255,255,255,0.3); border-radius: 999px; padding: 6px 14px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; backdrop-filter: blur(8px);">
                📷 Change Photo
              </button>
            ` : ''}
          </div>
          <div class="profile-content">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span class="eyebrow" style="margin: 0;">${escapeHtml(partner.profession)}</span>
              <span class="status-pill" style="font-size: 11px; background: rgba(16, 185, 129, 0.12); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3);">
                ✓ Verified Partner
              </span>
            </div>
            <h1>${escapeHtml(partner.name)}</h1>
            <p class="profile-role">${escapeHtml(partner.profession)}</p>
            <p class="profile-location">📍 ${escapeHtml(partner.location || 'India')}</p>
            <p class="profile-bio">${escapeHtml(partner.bio || 'Capturing unforgettable moments and crafting timeless memories.')}</p>

            <div class="profile-actions">
              ${isOwner ? `
                <button type="button" class="primary-btn" id="heroUploadBtn">
                  + Upload Work <span>↗</span>
                </button>
                <button type="button" class="secondary-btn" id="heroEditBtn">
                  Edit Profile <span>↗</span>
                </button>
                <button type="button" class="secondary-btn share-profile-btn" data-share-slug="${partner.slug}" data-share-name="${escapeHtml(partner.name)}" data-share-role="${escapeHtml(partner.profession)}" data-share-img="${escapeHtml(profileImg)}">
                  <svg class="share-icon" style="width:13px;height:13px;margin-right:6px;" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Share My Profile <span>↗</span>
                </button>
              ` : `
                <button type="button" class="primary-btn" data-enquire="${slug}">Contact / Enquire <span>↗</span></button>
                <button type="button" class="secondary-btn share-profile-btn" data-share-slug="${partner.slug}" data-share-name="${escapeHtml(partner.name)}" data-share-role="${escapeHtml(partner.profession)}" data-share-img="${escapeHtml(profileImg)}">
                  <svg class="share-icon" style="width:13px;height:13px;margin-right:6px;" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Share Profile <span>↗</span>
                </button>
                <a class="secondary-btn" href="partners.html">Browse all partners <span>→</span></a>
              `}
            </div>

            <div class="profile-socials">${publicLinks || '<span class="social-link">Portfolio</span>'}</div>
            <div class="profile-stats">
              <div class="profile-stat">
                <strong>${partner.rating ? Number(partner.rating).toFixed(1) : '4.9'} ★</strong>
                <span>Rating</span>
              </div>
              <div class="profile-stat">
                <strong>${allItems.length}</strong>
                <span>Media Items</span>
              </div>
              <div class="profile-stat">
                <strong>100%</strong>
                <span>Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="portfolio-section" style="margin-top: 48px;">
        <div class="portfolio-top">
          <div>
            <h2>Portfolio & Showcase</h2>
            <p style="color: #666; font-size: 14px; margin: 4px 0 0;">High-resolution photos, cinematic videos, and event highlights</p>
          </div>
          <div class="portfolio-tabs">${tabButtons}</div>
        </div>
        <div class="gallery-grid" id="portfolioGallery" style="margin-top: 24px;">
          ${portfolioMarkup}
        </div>
      </section>
    `;

    // Tab buttons event
    const portfolioButtons = container.querySelectorAll('[data-portfolio-tab]');
    portfolioButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const nextTab = button.dataset.portfolioTab;
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('slug', slug || partner.slug);
        urlParams.set('tab', nextTab);
        window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
        renderPartnerProfile();
      });
    });

    // Owner specific event bindings
    if (isOwner) {
      const openUpload = () => openUploadMediaStudio(partner);
      const openEdit = () => openEditProfileStudio(partner);

      const openUploadBtn = container.querySelector('#openUploadMediaBtn');
      if (openUploadBtn) openUploadBtn.addEventListener('click', openUpload);

      const openUploadGrid = container.querySelector('#openUploadMediaGridCard');
      if (openUploadGrid) openUploadGrid.addEventListener('click', openUpload);

      const heroUpload = container.querySelector('#heroUploadBtn');
      if (heroUpload) heroUpload.addEventListener('click', openUpload);

      const openEditBtn = container.querySelector('#openEditProfileBtn');
      if (openEditBtn) openEditBtn.addEventListener('click', openEdit);

      const heroEdit = container.querySelector('#heroEditBtn');
      if (heroEdit) heroEdit.addEventListener('click', openEdit);

      const changeAvatar = container.querySelector('#changeAvatarBtn');
      if (changeAvatar) changeAvatar.addEventListener('click', openEdit);

      const logoutBtn = container.querySelector('#ownerLogoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          if (window.SweepSageAPI) {
            await window.SweepSageAPI.logoutPartner();
          } else {
            localStorage.removeItem(STORAGE_KEYS.session);
            localStorage.removeItem('sweepsagePartnerToken');
          }
          showToast('You have been logged out.');
          setTimeout(() => {
            window.location.href = 'partner-login.html';
          }, 800);
        });
      }

      // Delete item buttons
      const deleteButtons = container.querySelectorAll('.owner-delete-btn');
      deleteButtons.forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const itemId = btn.dataset.deleteId;
          if (!itemId) return;

          const confirmed = window.confirm('Are you sure you want to permanently delete this media from your profile?');
          if (!confirmed) return;

          try {
            if (window.SweepSageAPI && window.SweepSageAPI.getStoredToken()) {
              await window.SweepSageAPI.deletePortfolioItem(itemId).catch((err) => {
                console.warn('API delete warning:', err);
              });
            }

            // Remove from local partner portfolio
            const allPartners = getPartnerProfiles();
            const target = allPartners.find((p) => p.slug === partner.slug || p.id === partner.id);
            if (target && target.portfolio) {
              target.portfolio = target.portfolio.filter((i) => String(i.id) !== String(itemId));
              target.portfolioCount = target.portfolio.length;
              localStorage.setItem(STORAGE_KEYS.partners, JSON.stringify(allPartners));
              partner.portfolio = target.portfolio;
            }

            showToast('Media removed from your profile.');
            renderPartnerProfile();
          } catch (err) {
            showToast(err.message || 'Could not delete item', 'error');
          }
        });
      });
    }

    // Enquiry button
    const enquiryButton = container.querySelector('[data-enquire]');
    if (enquiryButton) {
      enquiryButton.addEventListener('click', () => {
        const whatsappNumber = '919555826615';
        const message = `Hi SweepSage, I would like to enquire about booking partner ${partner.name} (${partner.profession}) in ${partner.location || 'India'}.`;
        const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        showToast(`Opening enquiry for ${partner.name}...`);
        setTimeout(() => {
          window.open(waUrl, '_blank');
        }, 300);
      });
    }

    // Lightbox / Media Viewer
    const galleryItems = container.querySelectorAll('.gallery-item');
    galleryItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.owner-delete-btn')) return;

        const src = decodeURIComponent(item.dataset.src || '');
        const title = decodeURIComponent(item.dataset.title || partner.name);
        const poster = decodeURIComponent(item.dataset.poster || '');
        const mediaType = item.dataset.media || 'image';

        openMediaLightbox({ src, title, poster, mediaType });
      });
    });

    // Sync live partner details from backend if available
    if (window.SweepSageAPI && !container.dataset.synced) {
      container.dataset.synced = 'true';
      window.SweepSageAPI.getPublicPartnerBySlug(slug || partner.slug).then((liveData) => {
        if (liveData && liveData.name) {
          const all = getPartnerProfiles();
          const idx = all.findIndex((p) => p.slug === liveData.slug || p.id === liveData.id);
          if (idx !== -1) {
            all[idx] = Object.assign({}, all[idx], liveData);
            localStorage.setItem(STORAGE_KEYS.partners, JSON.stringify(all));
            renderPartnerProfile();
          }
        }
      }).catch(() => {});
    }
  }

  function openMediaLightbox({ src, title, poster, mediaType }) {
    let lightbox = document.getElementById('portfolioLightbox');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.id = 'portfolioLightbox';
      lightbox.className = 'lightbox';
      lightbox.setAttribute('role', 'dialog');
      lightbox.setAttribute('aria-modal', 'true');
      document.body.appendChild(lightbox);
    }

    const content = mediaType === 'video'
      ? `<video src="${src}" controls autoplay playsinline poster="${poster || ''}" style="max-height: 80vh; max-width: 90vw; border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);"></video>`
      : `<img src="${src}" alt="${escapeHtml(title)}" style="max-height: 85vh; max-width: 90vw; object-fit: contain; border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">`;

    lightbox.innerHTML = `
      <div class="lightbox-shell" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <button class="lightbox-close" type="button" aria-label="Close" style="position: absolute; top: -45px; right: 0; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); border: none; color: #fff; font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center;">×</button>
        ${content}
        <div style="margin-top: 14px; color: #ffffff; font-size: 15px; font-weight: 600; text-align: center; max-width: 80vw;">${escapeHtml(title)}</div>
      </div>
    `;

    const closeBtn = lightbox.querySelector('.lightbox-close');
    const close = () => {
      lightbox.classList.remove('open');
      const vid = lightbox.querySelector('video');
      if (vid) vid.pause();
    };

    closeBtn.addEventListener('click', close);
    lightbox.onclick = (e) => {
      if (e.target === lightbox) close();
    };

    const onKey = (e) => {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', onKey);
      }
    };
    document.addEventListener('keydown', onKey);

    lightbox.classList.add('open');
  }

  function openUploadMediaStudio(partner) {
    if (!isProfileOwner(partner)) {
      alert('Security Protection: Only the authenticated owner of this profile can upload media.');
      return;
    }

    let overlay = document.querySelector('#uploadStudioModal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'uploadStudioModal';
      overlay.className = 'custom-modal-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="custom-modal-dialog">
        <div class="custom-modal-header">
          <div>
            <h3>Upload Media to Profile</h3>
            <p>Upload photos, cinematic videos, reels, or event portfolios</p>
          </div>
          <button type="button" class="custom-modal-close" id="closeUploadModalBtn" aria-label="Close">✕</button>
        </div>

        <div class="custom-modal-body">
          <div class="modal-tabs">
            <button type="button" class="modal-tab-btn active" data-tab-mode="file">📁 Upload from Device</button>
            <button type="button" class="modal-tab-btn" data-tab-mode="url">🔗 Media URL / Link</button>
          </div>

          <form id="studioUploadForm">
            <!-- File Dropzone Tab -->
            <div id="fileUploadSection">
              <div class="upload-dropzone" id="mediaDropzone">
                <div class="dropzone-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <strong>Drag & Drop photo or video here</strong>
                <span>or click to browse from your device (JPG, PNG, WEBP, MP4, WEBM, MOV)</span>
                <input type="file" id="mediaStudioFileInput" accept="image/*,video/*" style="display: none;">
              </div>

              <!-- Media Preview -->
              <div class="media-preview-container" id="mediaPreviewContainer">
                <div id="mediaPreviewWrapper"></div>
                <div class="preview-file-bar">
                  <span id="previewFileName">filename.jpg</span>
                  <button type="button" class="preview-clear-btn" id="previewClearBtn">Remove</button>
                </div>
              </div>

              <div class="form-field-group" id="videoPosterGroup" style="display: none;">
                <label for="posterStudioFileInput">Custom Video Poster (Optional Image)</label>
                <input type="file" id="posterStudioFileInput" accept="image/*">
              </div>
            </div>

            <!-- URL Tab -->
            <div id="urlUploadSection" style="display: none;">
              <div class="form-field-group">
                <label for="mediaUrlInput">Media URL</label>
                <input type="url" id="mediaUrlInput" placeholder="https://images.unsplash.com/... or https://...video.mp4">
              </div>

              <div class="form-field-group">
                <label for="posterUrlInput">Video Poster URL (Optional for videos)</label>
                <input type="url" id="posterUrlInput" placeholder="https://images.unsplash.com/...">
              </div>
            </div>

            <!-- Common Metadata -->
            <div class="form-field-group">
              <label for="mediaTitleInput">Title / Caption</label>
              <input type="text" id="mediaTitleInput" placeholder="e.g. Royal Wedding Highlights at Udaipur" required>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <div class="form-field-group">
                <label for="mediaCollectionSelect">Collection</label>
                <select id="mediaCollectionSelect" required>
                  <option value="Photos">Photos</option>
                  <option value="Videos">Videos</option>
                  <option value="Reels">Reels</option>
                  <option value="Events">Events</option>
                </select>
              </div>

              <div class="form-field-group">
                <label for="mediaTypeSelect">Media Type</label>
                <select id="mediaTypeSelect" required>
                  <option value="image">Image / Photo</option>
                  <option value="video">Video / Reel</option>
                </select>
              </div>
            </div>

            <button type="submit" class="upload-submit-btn" id="studioSubmitBtn">
              Publish to My Profile 🚀
            </button>
          </form>
        </div>
      </div>
    `;

    // State & elements
    let activeMode = 'file';
    let selectedFile = null;
    let selectedPosterFile = null;

    const fileTabBtn = overlay.querySelector('[data-tab-mode="file"]');
    const urlTabBtn = overlay.querySelector('[data-tab-mode="url"]');
    const fileSection = overlay.querySelector('#fileUploadSection');
    const urlSection = overlay.querySelector('#urlUploadSection');
    const dropzone = overlay.querySelector('#mediaDropzone');
    const fileInput = overlay.querySelector('#mediaStudioFileInput');
    const posterInput = overlay.querySelector('#posterStudioFileInput');
    const videoPosterGroup = overlay.querySelector('#videoPosterGroup');
    const previewContainer = overlay.querySelector('#mediaPreviewContainer');
    const previewWrapper = overlay.querySelector('#mediaPreviewWrapper');
    const previewFileName = overlay.querySelector('#previewFileName');
    const previewClearBtn = overlay.querySelector('#previewClearBtn');
    const mediaTypeSelect = overlay.querySelector('#mediaTypeSelect');
    const collectionSelect = overlay.querySelector('#mediaCollectionSelect');
    const titleInput = overlay.querySelector('#mediaTitleInput');
    const mediaUrlInput = overlay.querySelector('#mediaUrlInput');
    const posterUrlInput = overlay.querySelector('#posterUrlInput');
    const submitBtn = overlay.querySelector('#studioSubmitBtn');
    const closeBtn = overlay.querySelector('#closeUploadModalBtn');

    const closeModal = () => {
      overlay.classList.remove('open');
      selectedFile = null;
      selectedPosterFile = null;
    };

    closeBtn.onclick = closeModal;
    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };

    // Mode tabs
    fileTabBtn.onclick = () => {
      activeMode = 'file';
      fileTabBtn.classList.add('active');
      urlTabBtn.classList.remove('active');
      fileSection.style.display = 'block';
      urlSection.style.display = 'none';
    };

    urlTabBtn.onclick = () => {
      activeMode = 'url';
      urlTabBtn.classList.add('active');
      fileTabBtn.classList.remove('active');
      fileSection.style.display = 'none';
      urlSection.style.display = 'block';
    };

    // File selection
    dropzone.onclick = () => fileInput.click();

    dropzone.ondragover = (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    };
    dropzone.ondragleave = () => dropzone.classList.remove('dragover');
    dropzone.ondrop = (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileChosen(e.dataTransfer.files[0]);
      }
    };

    fileInput.onchange = () => {
      if (fileInput.files && fileInput.files[0]) {
        handleFileChosen(fileInput.files[0]);
      }
    };

    posterInput.onchange = () => {
      if (posterInput.files && posterInput.files[0]) {
        selectedPosterFile = posterInput.files[0];
      }
    };

    function handleFileChosen(file) {
      selectedFile = file;
      const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|m4v)$/i);

      mediaTypeSelect.value = isVideo ? 'video' : 'image';
      if (isVideo) {
        if (collectionSelect.value === 'Photos') collectionSelect.value = 'Videos';
        videoPosterGroup.style.display = 'block';
      } else {
        videoPosterGroup.style.display = 'none';
      }

      previewFileName.textContent = `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`;
      const objectUrl = URL.createObjectURL(file);

      if (isVideo) {
        previewWrapper.innerHTML = `<video src="${objectUrl}" controls playsinline style="width:100%; max-height: 240px;"></video>`;
      } else {
        previewWrapper.innerHTML = `<img src="${objectUrl}" alt="Preview" style="width:100%; max-height: 240px; object-fit: contain;">`;
      }

      previewContainer.classList.add('active');
      dropzone.style.display = 'none';

      if (!titleInput.value) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
        titleInput.value = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      }
    }

    previewClearBtn.onclick = () => {
      selectedFile = null;
      fileInput.value = '';
      previewContainer.classList.remove('active');
      previewWrapper.innerHTML = '';
      dropzone.style.display = 'flex';
      videoPosterGroup.style.display = 'none';
    };

    // Auto-detect type when URL typed
    mediaUrlInput.oninput = () => {
      const val = mediaUrlInput.value.trim().toLowerCase();
      if (val.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/) || val.includes('video') || val.includes('pexels.com/video-files')) {
        mediaTypeSelect.value = 'video';
        if (collectionSelect.value === 'Photos') collectionSelect.value = 'Videos';
      } else {
        mediaTypeSelect.value = 'image';
      }
    };

    // Form submission
    const form = overlay.querySelector('#studioUploadForm');
    form.onsubmit = async (e) => {
      e.preventDefault();

      if (!isProfileOwner(partner)) {
        alert('Security Alert: You are not authorized to upload to this profile.');
        return;
      }

      const title = titleInput.value.trim();
      const collection = collectionSelect.value;
      const mediaType = mediaTypeSelect.value;

      if (!title) {
        alert('Please enter a title for your work.');
        return;
      }

      if (activeMode === 'file' && !selectedFile) {
        alert('Please select a photo or video file from your device to upload.');
        return;
      }

      if (activeMode === 'url' && !mediaUrlInput.value.trim()) {
        alert('Please enter a valid media URL.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Publishing media...';

      try {
        let createdItem = null;

        if (activeMode === 'file') {
          // Direct file upload to backend
          if (window.SweepSageAPI && window.SweepSageAPI.getStoredToken()) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('title', title);
            formData.append('type', collection);
            formData.append('media_type', mediaType);
            if (selectedPosterFile) {
              formData.append('poster_file', selectedPosterFile);
            }
            const res = await window.SweepSageAPI.uploadPartnerMediaFile(formData);
            if (res && res.item) {
              createdItem = res.item;
            }
          }

          // Fallback if backend offline: read data URL
          if (!createdItem) {
            const dataUrl = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(selectedFile);
            });
            createdItem = {
              id: `item-${Date.now()}`,
              partner_id: partner.id,
              title,
              type: collection,
              media_type: mediaType,
              mediaType,
              src: dataUrl,
              poster: '',
              status: 'APPROVED'
            };
          }
        } else {
          // URL Upload
          const itemData = {
            title,
            type: collection,
            media_type: mediaType,
            mediaType,
            src: mediaUrlInput.value.trim(),
            poster: posterUrlInput.value.trim()
          };

          if (window.SweepSageAPI && window.SweepSageAPI.getStoredToken()) {
            const res = await window.SweepSageAPI.uploadPortfolio(itemData);
            if (res && res.item) {
              createdItem = res.item;
            }
          }

          if (!createdItem) {
            createdItem = {
              id: `item-${Date.now()}`,
              partner_id: partner.id,
              ...itemData,
              status: 'APPROVED'
            };
          }
        }

        // Update local memory and cache
        if (createdItem) {
          if (!createdItem.mediaType && createdItem.media_type) {
            createdItem.mediaType = createdItem.media_type;
          }

          const allPartners = getPartnerProfiles();
          const target = allPartners.find((p) => p.slug === partner.slug || p.id === partner.id);
          if (target) {
            if (!target.portfolio) target.portfolio = [];
            target.portfolio.unshift(createdItem);
            target.portfolioCount = target.portfolio.length;
            localStorage.setItem(STORAGE_KEYS.partners, JSON.stringify(allPartners));
            partner.portfolio = target.portfolio;
          }

          closeModal();
          showToast(`🎉 "${title}" uploaded and published to your profile!`);

          // Activate matching tab so creator sees it immediately
          const params = new URLSearchParams(window.location.search);
          params.set('slug', partner.slug);
          params.set('tab', collection);
          window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);

          renderPartnerProfile();
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert(err.message || 'Failed to upload media. Please try again.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish to My Profile 🚀';
      }
    };

    overlay.classList.add('open');
  }

  function openEditProfileStudio(partner) {
    if (!isProfileOwner(partner)) {
      alert('Security Alert: You cannot edit another partner profile.');
      return;
    }

    let overlay = document.querySelector('#editProfileModal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'editProfileModal';
      overlay.className = 'custom-modal-overlay';
      document.body.appendChild(overlay);
    }

    const currentImg = partner.profileImage || partner.profile_image || '';

    overlay.innerHTML = `
      <div class="custom-modal-dialog">
        <div class="custom-modal-header">
          <div>
            <h3>Edit Partner Profile</h3>
            <p>Update your public creator card, bio, and contact information</p>
          </div>
          <button type="button" class="custom-modal-close" id="closeEditModalBtn" aria-label="Close">✕</button>
        </div>

        <div class="custom-modal-body">
          <form id="studioEditProfileForm">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
              <img id="avatarPreviewThumb" src="${currentImg}" alt="Avatar" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid var(--logo-color, #fc5e68);">
              <div style="flex: 1;">
                <label style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #444; display: block; margin-bottom: 6px;">Profile Photo</label>
                <input type="file" id="editAvatarFileInput" accept="image/*" style="font-size: 13px;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <div class="form-field-group">
                <label for="editName">Full Name</label>
                <input type="text" id="editName" value="${escapeHtml(partner.name || '')}" required>
              </div>
              <div class="form-field-group">
                <label for="editProfession">Profession / Speciality</label>
                <input type="text" id="editProfession" value="${escapeHtml(partner.profession || '')}" required>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <div class="form-field-group">
                <label for="editLocation">Location</label>
                <input type="text" id="editLocation" value="${escapeHtml(partner.location || '')}" placeholder="e.g. Delhi NCR">
              </div>
              <div class="form-field-group">
                <label for="editPhone">Contact Phone</label>
                <input type="tel" id="editPhone" value="${escapeHtml(partner.phone || '')}" placeholder="+91 98...">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <div class="form-field-group">
                <label for="editInstagram">Instagram Handle</label>
                <input type="text" id="editInstagram" value="${escapeHtml(partner.instagram || (partner.social && partner.social.instagram) || '')}" placeholder="@yourhandle">
              </div>
              <div class="form-field-group">
                <label for="editWebsite">Website URL</label>
                <input type="text" id="editWebsite" value="${escapeHtml(partner.website || (partner.social && partner.social.website) || '')}" placeholder="yourportfolio.com">
              </div>
            </div>

            <div class="form-field-group">
              <label for="editBio">Bio / About You</label>
              <textarea id="editBio" placeholder="Describe your style, services, and craft...">${escapeHtml(partner.bio || '')}</textarea>
            </div>

            <button type="submit" class="upload-submit-btn" id="saveProfileBtn">
              Save Profile Changes 💾
            </button>
          </form>
        </div>
      </div>
    `;

    const closeBtn = overlay.querySelector('#closeEditModalBtn');
    const avatarInput = overlay.querySelector('#editAvatarFileInput');
    const avatarThumb = overlay.querySelector('#avatarPreviewThumb');
    let newAvatarFile = null;

    const closeModal = () => overlay.classList.remove('open');
    closeBtn.onclick = closeModal;
    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };

    avatarInput.onchange = () => {
      if (avatarInput.files && avatarInput.files[0]) {
        newAvatarFile = avatarInput.files[0];
        avatarThumb.src = URL.createObjectURL(newAvatarFile);
      }
    };

    const form = overlay.querySelector('#studioEditProfileForm');
    form.onsubmit = async (e) => {
      e.preventDefault();

      if (!isProfileOwner(partner)) {
        alert('Security Alert: You cannot edit another partner profile.');
        return;
      }

      const saveBtn = overlay.querySelector('#saveProfileBtn');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving changes...';

      try {
        let avatarUrl = partner.profileImage || partner.profile_image || '';

        // If new avatar file uploaded
        if (newAvatarFile && window.SweepSageAPI && window.SweepSageAPI.getStoredToken()) {
          const avRes = await window.SweepSageAPI.uploadPartnerAvatar(newAvatarFile).catch(() => null);
          if (avRes && avRes.avatar_url) {
            avatarUrl = avRes.avatar_url;
          }
        } else if (newAvatarFile) {
          avatarUrl = avatarThumb.src;
        }

        const profileData = {
          name: overlay.querySelector('#editName').value.trim(),
          profession: overlay.querySelector('#editProfession').value.trim(),
          location: overlay.querySelector('#editLocation').value.trim(),
          phone: overlay.querySelector('#editPhone').value.trim(),
          instagram: overlay.querySelector('#editInstagram').value.trim(),
          website: overlay.querySelector('#editWebsite').value.trim(),
          bio: overlay.querySelector('#editBio').value.trim(),
          profile_image: avatarUrl,
          profileImage: avatarUrl
        };

        if (window.SweepSageAPI && window.SweepSageAPI.getStoredToken()) {
          await window.SweepSageAPI.updatePartnerProfile(profileData);
        }

        // Update local memory
        const allPartners = getPartnerProfiles();
        const target = allPartners.find((p) => p.slug === partner.slug || p.id === partner.id);
        if (target) {
          Object.assign(target, profileData);
          if (!target.social) target.social = {};
          target.social.instagram = profileData.instagram;
          target.social.website = profileData.website;
          localStorage.setItem(STORAGE_KEYS.partners, JSON.stringify(allPartners));
        }

        const activeSession = getActivePartner();
        if (activeSession) {
          localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(Object.assign({}, activeSession, profileData)));
        }

        closeModal();
        showToast('Profile updated successfully! ✨');
        renderPartnerProfile();
      } catch (err) {
        alert(err.message || 'Failed to save profile changes.');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Profile Changes 💾';
      }
    };

    overlay.classList.add('open');
  }

  function initPartnerRegistration() {
    const form = document.querySelector('#partnerRegisterForm');
    if (!form) {
      return;
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Create partner profile';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Submitting Application...';
      }

      const formData = new FormData(form);
      const name = String(formData.get('fullName') || '').trim();
      const email = String(formData.get('email') || '').trim().toLowerCase();
      const phone = String(formData.get('phone') || '').trim();
      const password = String(formData.get('password') || '').trim();
      const profession = String(formData.get('profession') || '').trim();
      const location = String(formData.get('location') || '').trim();
      const instagram = String(formData.get('instagram') || '').trim();
      const bio = String(formData.get('bio') || '').trim() || `Verified ${profession} professional serving clients across ${location}.`;

      if (!name || !email || !password || !profession || !location) {
        window.alert('Please fill in all required profile details before continuing.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
        return;
      }

      let registeredPartner = null;
      let approvalUrl = '';
      let rejectUrl = '';

      if (window.SweepSageAPI) {
        try {
          const res = await window.SweepSageAPI.registerPartner({
            name,
            email,
            phone,
            password,
            profession,
            location,
            bio,
            instagram,
            website: ''
          });
          if (res && res.partner) {
            registeredPartner = res.partner;
            approvalUrl = res.approval_url || `http://127.0.0.1:8000/api/admin/partners/approve?token=${registeredPartner.approval_token || ''}`;
            rejectUrl = res.reject_url || `http://127.0.0.1:8000/api/admin/partners/reject?token=${registeredPartner.approval_token || ''}`;
          }
        } catch (err) {
          console.warn('[SweepSage] API registration fallback:', err);
          if (err && err.status === 400 && String(err.message || '').toLowerCase().includes('already exists')) {
            window.alert('An account with this email already exists. Please log in.');
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalBtnText;
            }
            return;
          }
        }
      }

      if (!registeredPartner) {
        registeredPartner = {
          id: `partner-${Date.now()}`,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `partner-${Date.now()}`,
          name,
          email,
          phone,
          profession,
          location,
          bio,
          instagram,
          status: 'PENDING'
        };
        const currentOrigin = (window.location.origin && window.location.origin.startsWith('http')) ? window.location.origin : 'http://127.0.0.1:8000';
        approvalUrl = `${currentOrigin}/partners.html?action=approve&id=${registeredPartner.id}`;
        rejectUrl = `${currentOrigin}/partners.html?action=reject&id=${registeredPartner.id}`;
      }

      // Add to local state as pending
      const profiles = getPartnerProfiles();
      const idx = profiles.findIndex(p => p.email && p.email.toLowerCase() === email);
      if (idx !== -1) {
        profiles[idx] = Object.assign({}, profiles[idx], registeredPartner);
      } else {
        profiles.unshift(registeredPartner);
      }
      localStorage.setItem(STORAGE_KEYS.partners, JSON.stringify(profiles));

      // Construct WhatsApp approval message for admin (919555826615)
      const adminWhatsApp = '919555826615';
      const waText = 
`🤝 *NEW PARTNER REGISTRATION APPROVAL - SWEEPSAGE* 🤝

A new partner has registered and requested approval:

👤 *Name:* ${registeredPartner.name}
💼 *Profession:* ${registeredPartner.profession}
📍 *Location:* ${registeredPartner.location}
📞 *Phone:* ${registeredPartner.phone || 'Not provided'}
✉️ *Email:* ${registeredPartner.email}
${registeredPartner.instagram ? `🔗 *Instagram:* ${registeredPartner.instagram}\n` : ''}🆔 *Partner ID:* #${registeredPartner.id}

──────────────────────────
✅ *CLICK TO APPROVE (Profile Goes Live Instantly):*
${approvalUrl}

❌ *CLICK TO REJECT:*
${rejectUrl}
──────────────────────────
SweepSage Admin System`;

      const waUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(waText)}`;

      // Automatically launch WhatsApp with approval request
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 350);

      // Render on-screen confirmation card
      const authCard = form.closest('.partner-form-card') || form.closest('.auth-card') || form.parentElement;
      if (authCard) {
        authCard.innerHTML = `
          <div style="text-align: center; padding: 24px 12px;">
            <div style="width: 72px; height: 72px; border-radius: 50%; background: rgba(37, 211, 102, 0.15); border: 2.5px solid #25D366; color: #25D366; display: inline-flex; align-items: center; justify-content: center; font-size: 34px; margin-bottom: 20px; box-shadow: 0 0 30px rgba(37, 211, 102, 0.25);">
              📱
            </div>
            <span class="eyebrow dark" style="display:block; margin-bottom: 8px; color: #fc5e68; font-weight: 800;">APPLICATION SUBMITTED</span>
            <h2 style="font-family: 'Manrope', sans-serif; font-size: 26px; font-weight: 800; margin-bottom: 12px; color: inherit;">Approval Request Dispatched!</h2>
            <p style="color: #94a3b8; font-size: 14.5px; line-height: 1.6; max-width: 440px; margin: 0 auto 24px;">
              Your details have been submitted. WhatsApp was launched to dispatch the approval notification directly to SweepSage Admin (<strong>+91 95558 26615</strong>).
            </p>

            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 18px 20px; margin-bottom: 24px; text-align: left;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 6px;">
                <div style="font-size: 16px; font-weight: 800; color: inherit;">${escapeHtml(registeredPartner.name)}</div>
                <span style="font-size: 11px; font-weight: 800; color: #f59e0b; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); padding: 3px 10px; border-radius: 999px;">
                  ⏳ PENDING WHATSAPP APPROVAL
                </span>
              </div>
              <div style="font-size: 13px; color: #94a3b8; margin-bottom: 6px;">
                💼 ${escapeHtml(registeredPartner.profession)} • 📍 ${escapeHtml(registeredPartner.location)}
              </div>
              <div style="font-size: 12.5px; color: #64748b;">
                ✉️ ${escapeHtml(registeredPartner.email)} • 📞 ${escapeHtml(registeredPartner.phone || 'N/A')}
              </div>
            </div>

            <p style="font-size: 13.5px; color: #10b981; margin-bottom: 24px; font-weight: 600; line-height: 1.5;">
              ✨ Once approved on WhatsApp, your profile will immediately become LIVE on SweepSage!
            </p>

            <div style="display: flex; flex-direction: column; gap: 12px;">
              <a href="${waUrl}" target="_blank" class="portal-submit-btn" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 10px; background: #25D366; color: #fff; box-shadow: 0 10px 25px rgba(37, 211, 102, 0.35);">
                <span>Open WhatsApp to Confirm Approval</span> <span>↗</span>
              </a>
              <a href="partner-login.html" style="display: inline-block; padding: 12px 20px; border-radius: 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: inherit; text-decoration: none; font-size: 13.5px; font-weight: 700;">
                Proceed to Partner Login →
              </a>
            </div>
          </div>
        `;
      }
    });
  }

  function initPartnerLogin() {
    const form = document.querySelector('#partnerLoginForm');
    if (!form) {
      return;
    }

    const session = localStorage.getItem(STORAGE_KEYS.session);
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed && parsed.email) {
          window.location.href = 'partner-dashboard.html';
        }
      } catch (_error) {
        localStorage.removeItem(STORAGE_KEYS.session);
      }
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const email = String(formData.get('email')).trim().toLowerCase();
      const password = String(formData.get('password')).trim();

      if (!email || !password) {
        window.alert('Please enter both email and password.');
        return;
      }

      if (window.SweepSageAPI) {
        try {
          const res = await window.SweepSageAPI.loginPartner(email, password);
          if (res && res.token) {
            window.location.href = 'partner-dashboard.html';
            return;
          }
        } catch (err) {
          console.warn('Backend login notice:', err.message);
          window.alert(err.message || 'We could not find a matching partner account. Please verify your details.');
          return;
        }
      }

      const profiles = getPartnerProfiles();
      const account = profiles.find((partner) => partner.email && partner.email.toLowerCase() === email && partner.password === password);

      if (!account) {
        window.alert('We could not find a matching partner account. Please verify your details or create a new account.');
        return;
      }

      const sessionPayload = {
        email: account.email,
        name: account.name,
        profession: account.profession,
        status: account.status,
        lastLogin: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(sessionPayload));
      window.location.href = 'partner-dashboard.html';
    });
  }

  async function initDashboard() {
    const dashboardRoot = document.querySelector('#dashboardRoot');
    if (!dashboardRoot) {
      return;
    }

    const session = localStorage.getItem(STORAGE_KEYS.session);
    if (!session && !localStorage.getItem('sweepsagePartnerToken')) {
      window.location.href = 'partner-login.html';
      return;
    }

    let activePartner = getActivePartner();

    // Sync live profile from backend if token exists
    if (window.SweepSageAPI && window.SweepSageAPI.getStoredToken()) {
      try {
        const livePartner = await window.SweepSageAPI.getPartnerMe();
        if (livePartner) {
          activePartner = livePartner;
          localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({
            email: livePartner.email,
            name: livePartner.name,
            profession: livePartner.profession,
            status: livePartner.status,
            lastLogin: new Date().toISOString()
          }));
        }
      } catch (err) {
        console.warn('Could not sync partner from backend:', err.message);
      }
    }

    if (!activePartner) {
      localStorage.removeItem(STORAGE_KEYS.session);
      window.location.href = 'partner-login.html';
      return;
    }

    const statusText = activePartner.status || 'PENDING';
    const overview = document.querySelector('#overviewTab');
    const profileView = document.querySelector('#profileTab');
    const portfolioView = document.querySelector('#portfolioTab');
    const uploadView = document.querySelector('#uploadTab');
    const settingsView = document.querySelector('#settingsTab');
    const navButtons = document.querySelectorAll('[data-dashboard-section]');

    function showSection(sectionName) {
      const sections = [overview, profileView, portfolioView, uploadView, settingsView];
      sections.forEach((section) => {
        if (!section) {
          return;
        }
        const shouldShow = section.dataset.section === sectionName;
        section.classList.toggle('hidden', !shouldShow);
      });

      navButtons.forEach((button) => {
        const isActive = button.dataset.dashboardSection === sectionName;
        button.classList.toggle('active', isActive);
      });
    }

    navButtons.forEach((button) => {
      button.addEventListener('click', () => showSection(button.dataset.dashboardSection));
    });

    const welcomeName = document.querySelector('#dashboardWelcomeName');
    if (welcomeName) {
      welcomeName.textContent = activePartner.name;
    }

    const partnerStatus = document.querySelector('#partnerStatusBadge');
    if (partnerStatus) {
      partnerStatus.textContent = statusText;
    }

    const totalPortfolio = document.querySelector('#totalPortfolioCount');
    const approvedCount = document.querySelector('#approvedCount');
    const pendingCount = document.querySelector('#pendingCount');
    const rejectedCount = document.querySelector('#rejectedCount');

    const portfolioItems = activePartner.portfolio || [];
    const approved = portfolioItems.filter((item) => String(item.status || 'APPROVED').toUpperCase() === 'APPROVED').length;
    const pending = portfolioItems.filter((item) => String(item.status || 'APPROVED').toUpperCase() === 'PENDING').length;
    const rejected = portfolioItems.filter((item) => String(item.status || 'APPROVED').toUpperCase() === 'REJECTED').length;

    if (totalPortfolio) totalPortfolio.textContent = String(portfolioItems.length);
    if (approvedCount) approvedCount.textContent = String(approved);
    if (pendingCount) pendingCount.textContent = String(pending);
    if (rejectedCount) rejectedCount.textContent = String(rejected);

    const portfolioList = document.querySelector('#portfolioList');
    if (portfolioList) {
      if (!portfolioItems.length) {
        portfolioList.innerHTML = '<div class="partner-empty">Your portfolio is empty. Upload work from the Upload Work tab to begin.</div>';
      } else {
        portfolioList.innerHTML = portfolioItems.map((item) => `
          <div class="portfolio-item-row">
            <img src="${item.src || item.poster || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'}" alt="${item.title}">
            <div>
              <h4>${item.title}</h4>
              <p>${item.type} • ${item.media_type || item.mediaType || 'image'}</p>
            </div>
            <span class="item-type-pill">${item.status || 'Approved'}</span>
          </div>
        `).join('');
      }
    }

    const activeSlug = activePartner.slug || (activePartner.name ? activePartner.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'partner');
    const profileHref = getProfilePageHref(activeSlug);
    document.querySelectorAll('#dashboardPublicProfileLink, #sidebarPublicProfileLink, #profileTabPublicProfileLink, #portfolioTabPublicProfileLink').forEach(link => {
      link.href = profileHref;
      link.style.display = 'inline-flex';
    });

    const profileForm = document.querySelector('#partnerProfileForm');
    if (profileForm) {
      profileForm.name.value = activePartner.name || '';
      profileForm.email.value = activePartner.email || '';
      profileForm.phone.value = activePartner.phone || '';
      profileForm.profession.value = activePartner.profession || '';
      profileForm.location.value = activePartner.location || '';
      if (profileForm.profileImage) profileForm.profileImage.value = activePartner.profileImage || activePartner.profile_image || '';
      if (profileForm.instagram) profileForm.instagram.value = activePartner.instagram || (activePartner.social && activePartner.social.instagram) || '';
      if (profileForm.website) profileForm.website.value = activePartner.website || (activePartner.social && activePartner.social.website) || '';
      profileForm.bio.value = activePartner.bio || '';

      profileForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const profileImgVal = profileForm.profileImage ? profileForm.profileImage.value.trim() : (activePartner.profileImage || activePartner.profile_image || '');
        const instaVal = profileForm.instagram ? profileForm.instagram.value.trim() : '';
        const webVal = profileForm.website ? profileForm.website.value.trim() : '';

        const profileData = {
          name: profileForm.name.value.trim(),
          phone: profileForm.phone.value.trim(),
          profession: profileForm.profession.value.trim(),
          location: profileForm.location.value.trim(),
          profile_image: profileImgVal,
          profileImage: profileImgVal,
          instagram: instaVal,
          website: webVal,
          bio: profileForm.bio.value.trim()
        };

        if (window.SweepSageAPI && window.SweepSageAPI.getStoredToken()) {
          try {
            await window.SweepSageAPI.updatePartnerProfile(profileData);
          } catch (err) {
            console.warn('Backend profile update note:', err);
          }
        }

        const updated = getPartnerProfiles();
        const target = updated.find((partner) => partner.email && partner.email.toLowerCase() === activePartner.email.toLowerCase());
        if (target) {
          Object.assign(target, profileData);
          if (!target.social) target.social = {};
          target.social.instagram = instaVal;
          target.social.website = webVal;
          localStorage.setItem(STORAGE_KEYS.partners, JSON.stringify(updated));
        }

        localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(Object.assign({}, activePartner, profileData)));
        window.alert('Profile saved successfully.');
        window.location.reload();
      });
    }

    const uploadForm = document.querySelector('#uploadWorkForm');
    if (uploadForm) {
      uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const fileInput = uploadForm.querySelector('#dashboardFileInput');
        const chosenFile = fileInput && fileInput.files ? fileInput.files[0] : null;
        const title = uploadForm.title.value.trim();
        const collection = uploadForm.type.value;
        const mediaType = uploadForm.mediaType.value;
        const urlSrc = uploadForm.src.value.trim();
        const posterSrc = uploadForm.poster.value.trim();

        if (!title) {
          window.alert('Please enter a title for your work.');
          return;
        }

        if (!chosenFile && !urlSrc) {
          window.alert('Please select a photo/video file from your device or provide a media URL.');
          return;
        }

        let uploadedItem = null;

        if (chosenFile) {
          if (window.SweepSageAPI && window.SweepSageAPI.getStoredToken()) {
            try {
              const formData = new FormData();
              formData.append('file', chosenFile);
              formData.append('title', title);
              formData.append('type', collection);
              formData.append('media_type', mediaType);
              if (posterSrc) formData.append('poster_url', posterSrc);

              const res = await window.SweepSageAPI.uploadPartnerMediaFile(formData);
              if (res && res.item) uploadedItem = res.item;
            } catch (err) {
              console.warn('Backend file upload note:', err);
            }
          }

          if (!uploadedItem) {
            const dataUrl = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(chosenFile);
            });
            uploadedItem = {
              id: `item-${Date.now()}`,
              partner_id: activePartner.id,
              title,
              type: collection,
              media_type: mediaType,
              mediaType,
              src: dataUrl,
              poster: posterSrc,
              status: 'APPROVED'
            };
          }
        } else {
          const item = {
            title,
            type: collection,
            media_type: mediaType,
            src: urlSrc,
            poster: posterSrc
          };

          if (window.SweepSageAPI && window.SweepSageAPI.getStoredToken()) {
            try {
              const res = await window.SweepSageAPI.uploadPortfolio(item);
              if (res && res.item) uploadedItem = res.item;
            } catch (err) {
              console.warn('Backend upload note:', err);
            }
          }

          if (!uploadedItem) {
            uploadedItem = {
              id: `item-${Date.now()}`,
              partner_id: activePartner.id,
              ...item,
              status: 'APPROVED'
            };
          }
        }

        const updated = getPartnerProfiles();
        const target = updated.find((partner) => partner.email && partner.email.toLowerCase() === activePartner.email.toLowerCase());
        if (target) {
          if (!target.portfolio) target.portfolio = [];
          target.portfolio.unshift(uploadedItem);
          target.portfolioCount = target.portfolio.length;
          localStorage.setItem(STORAGE_KEYS.partners, JSON.stringify(updated));
        }

        uploadForm.reset();
        window.alert('Your work has been uploaded successfully to your profile!');
        window.location.reload();
      });
    }

    const settingsForm = document.querySelector('#settingsForm');
    if (settingsForm) {
      settingsForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const bio = settingsForm.bio.value.trim();

        if (window.SweepSageAPI && window.SweepSageAPI.getStoredToken()) {
          try {
            await window.SweepSageAPI.updatePartnerProfile({ bio });
          } catch (_) {}
        }

        const updated = getPartnerProfiles();
        const target = updated.find((partner) => partner.email && partner.email.toLowerCase() === activePartner.email.toLowerCase());
        if (target) {
          target.bio = bio;
          localStorage.setItem(STORAGE_KEYS.partners, JSON.stringify(updated));
        }
        window.alert('Settings saved.');
      });
    }

    const logoutButton = document.querySelector('#logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', async () => {
        if (window.SweepSageAPI) {
          await window.SweepSageAPI.logoutPartner();
        }
        localStorage.removeItem(STORAGE_KEYS.session);
        window.location.href = 'partner-login.html';
      });
    }

    showSection('overview');
  }

  function initPublicPartnerLinks() {
    const path = window.location.pathname || '';
    document.querySelectorAll('a[href="partners.html"]').forEach((link) => {
      if (path.endsWith('/partners.html')) {
        link.setAttribute('href', 'partners.html');
      }
    });
  }

  function ensureShareModal() {
    let modal = document.querySelector('#partnerShareModal');
    if (modal) {
      return modal;
    }

    modal = document.createElement('div');
    modal.id = 'partnerShareModal';
    modal.className = 'partner-share-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="share-modal-backdrop" data-close-share-modal></div>
      <div class="share-modal-dialog">
        <button type="button" class="share-modal-close" data-close-share-modal aria-label="Close share dialog">×</button>
        
        <div class="share-modal-header">
          <div class="share-modal-avatar">
            <img id="shareModalImg" src="logo.png" alt="Partner Avatar">
          </div>
          <div class="share-modal-title">
            <span class="share-eyebrow" id="shareModalRole">Partner Profile</span>
            <h3 id="shareModalName">Partner Name</h3>
            <p class="share-subtitle">Scan QR code or copy direct profile link to share.</p>
          </div>
        </div>

        <div class="share-qr-container">
          <div class="share-qr-box">
            <img id="shareModalQr" src="" alt="Profile QR Code" loading="eager">
            <div class="qr-scan-badge">Scan to View Profile</div>
          </div>
        </div>

        <div class="share-link-group">
          <label for="shareLinkInput">Direct Profile Link</label>
          <div class="share-link-input-wrap">
            <input type="text" id="shareLinkInput" readonly value="">
            <button type="button" id="shareCopyBtn" class="share-copy-btn" aria-label="Copy profile link">
              <svg class="copy-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-2V5H5v11h4v2H5a2 2 0 01-2-2V5z" />
                <path d="M15 11h-4a1 1 0 00-1 1v5a1 1 0 001 1h4a1 1 0 001-1v-5a1 1 0 00-1-1zm-1 5h-2v-3h2v3z" />
              </svg>
              <span id="shareCopyBtnText">Copy Link</span>
            </button>
          </div>
        </div>

        <div class="share-actions-row">
          <a id="shareWhatsappBtn" class="share-action-btn whatsapp-share" href="#" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor" class="social-icon">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.34C9.33 7.34 9 7.42 8.79 7.64C8.58 7.86 8 8.41 8 9.53C8 10.65 8.82 11.73 8.93 11.89C9.05 12.04 10.54 14.34 12.82 15.32C13.38 15.56 13.82 15.71 14.16 15.82C14.73 16 15.24 15.97 15.65 15.91C16.11 15.84 17.06 15.33 17.26 14.77C17.46 14.21 17.46 13.73 17.4 13.63C17.34 13.53 17.18 13.47 16.92 13.34C16.66 13.21 15.39 12.58 15.16 12.5C14.92 12.41 14.76 12.37 14.6 12.63C14.43 12.88 13.96 13.44 13.82 13.6C13.68 13.76 13.54 13.78 13.28 13.65C13.02 13.53 12.19 13.25 11.21 12.38C10.45 11.7 9.93 10.86 9.79 10.61C9.65 10.36 9.77 10.22 9.9 10.09C10.02 9.97 10.16 9.78 10.29 9.63C10.43 9.47 10.47 9.36 10.56 9.19C10.65 9.03 10.6 8.89 10.54 8.76C10.47 8.63 10 7.47 9.8 7C9.61 6.54 9.42 6.6 9.27 6.6C9.13 6.6 8.97 6.6 8.8 6.6L9.53 7.34Z" />
            </svg>
            <span>WhatsApp</span>
          </a>

          <button type="button" id="shareNativeBtn" class="share-action-btn native-share">
            <svg viewBox="0 0 20 20" fill="currentColor" class="social-icon">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            <span>Share Profile</span>
          </button>

          <a id="shareDownloadQrBtn" class="share-action-btn download-share" href="#" download="partner-qr.png" target="_blank">
            <svg viewBox="0 0 20 20" fill="currentColor" class="social-icon">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            <span>Save QR</span>
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll('[data-close-share-modal]').forEach((btn) => {
      btn.addEventListener('click', closeShareModal);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeShareModal();
      }
    });

    const copyBtn = modal.querySelector('#shareCopyBtn');
    const copyText = modal.querySelector('#shareCopyBtnText');
    const linkInput = modal.querySelector('#shareLinkInput');

    copyBtn.addEventListener('click', async () => {
      const url = linkInput.value;
      try {
        await navigator.clipboard.writeText(url);
        copyText.textContent = 'Copied! ✓';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyText.textContent = 'Copy Link';
          copyBtn.classList.remove('copied');
        }, 2200);
      } catch (_err) {
        linkInput.select();
        document.execCommand('copy');
        copyText.textContent = 'Copied! ✓';
        setTimeout(() => {
          copyText.textContent = 'Copy Link';
        }, 2200);
      }
    });

    const nativeBtn = modal.querySelector('#shareNativeBtn');
    nativeBtn.addEventListener('click', async () => {
      const url = linkInput.value;
      const name = modal.querySelector('#shareModalName').textContent;
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${name} | SweepSage Partner`,
            text: `View ${name}'s portfolio & services on SweepSage:`,
            url: url
          });
        } catch (_e) {}
      } else {
        copyBtn.click();
      }
    });

    return modal;
  }

  function openShareModal(info) {
    const modal = ensureShareModal();
    const profileHref = getProfilePageHref(info.slug);
    const absoluteUrl = new URL(profileHref, window.location.href).href;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(absoluteUrl)}`;

    const avatar = modal.querySelector('#shareModalImg');
    if (avatar) avatar.src = info.img || 'logo.png';
    const nameNode = modal.querySelector('#shareModalName');
    if (nameNode) nameNode.textContent = info.name || 'Partner Profile';
    const roleNode = modal.querySelector('#shareModalRole');
    if (roleNode) roleNode.textContent = info.role || 'SweepSage Partner';
    const qrNode = modal.querySelector('#shareModalQr');
    if (qrNode) qrNode.src = qrUrl;
    const linkInput = modal.querySelector('#shareLinkInput');
    if (linkInput) linkInput.value = absoluteUrl;

    const shareText = `Check out ${info.name || 'this partner'} on SweepSage: ${absoluteUrl}`;
    const whatsappBtn = modal.querySelector('#shareWhatsappBtn');
    if (whatsappBtn) {
      whatsappBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    }
    const downloadBtn = modal.querySelector('#shareDownloadQrBtn');
    if (downloadBtn) {
      downloadBtn.href = qrUrl;
      downloadBtn.setAttribute('download', `sweepsage-${info.slug || 'partner'}-qr.png`);
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeShareModal() {
    const modal = document.querySelector('#partnerShareModal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  function initShareModal() {
    ensureShareModal();
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-share-slug]');
      if (!trigger) return;
      e.preventDefault();
      e.stopPropagation();

      const slug = trigger.dataset.shareSlug;
      const name = trigger.dataset.shareName;
      const role = trigger.dataset.shareRole;
      const img = trigger.dataset.shareImg;
      openShareModal({ slug, name, role, img });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureDefaultData();
    initAllPartnerGrids();
    renderPartnerProfile();
    initPartnerRegistration();
    initPartnerLogin();
    initDashboard();
    initPublicPartnerLinks();
    initShareModal();

    if (window.SweepSageAPI) {
      window.SweepSageAPI.getPublicPartners({ status: 'APPROVED' }).then((livePartners) => {
        if (Array.isArray(livePartners) && livePartners.length) {
          localStorage.setItem(STORAGE_KEYS.partners, JSON.stringify(livePartners));
          initAllPartnerGrids();
        }
      }).catch(() => {});
    }
  });
})();

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
