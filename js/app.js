/**
 * Tabwai - Minimalist & Motion New Tab
 * Application Controller with Liquid Rectangle Boxes Engine
 */

(function () {
  'use strict';

  // Default Built-in Categories (Liquid Boxes)
  const DEFAULT_BOXES = [
    {
      id: 'productivity',
      title: 'Productivity & Workspace',
      icon: '⚡',
      color: 'cyan',
      isDefault: true
    },
    {
      id: 'social',
      title: 'Social & Community',
      icon: '💬',
      color: 'purple',
      isDefault: true
    },
    {
      id: 'entertainment',
      title: 'Media & Entertainment',
      icon: '🎬',
      color: 'rose',
      isDefault: true
    },
    {
      id: 'dev',
      title: 'Developer & Tools',
      icon: '💻',
      color: 'emerald',
      isDefault: true
    },
    {
      id: 'quick-access',
      title: 'Quick Access',
      icon: '📌',
      color: 'amber',
      isDefault: true
    }
  ];

  // Default Clean Starter Shortcuts (Loaded initially or when resetting preferences)
  const DEFAULT_CUSTOM_SITES = [
    // Productivity & Workspace
    { title: 'Google Docs', url: 'https://docs.google.com', boxId: 'productivity' },
    { title: 'GitHub', url: 'https://github.com', boxId: 'productivity' },
    { title: 'ChatGPT', url: 'https://chatgpt.com', boxId: 'productivity' },
    { title: 'Claude AI', url: 'https://claude.ai', boxId: 'productivity' },

    // Social & Community
    { title: 'Reddit', url: 'https://reddit.com', boxId: 'social' },
    { title: 'YouTube', url: 'https://youtube.com', boxId: 'social' },
    { title: 'X (Twitter)', url: 'https://x.com', boxId: 'social' },
    { title: 'Discord', url: 'https://discord.com', boxId: 'social' },

    // Media & Entertainment
    { title: 'Netflix', url: 'https://netflix.com', boxId: 'entertainment' },
    { title: 'Spotify', url: 'https://open.spotify.com', boxId: 'entertainment' },
    { title: 'Twitch', url: 'https://twitch.tv', boxId: 'entertainment' },
    { title: 'Prime Video', url: 'https://primevideo.com', boxId: 'entertainment' },

    // Developer & Tools
    { title: 'Stack Overflow', url: 'https://stackoverflow.com', boxId: 'dev' },
    { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', boxId: 'dev' },
    { title: 'LeetCode', url: 'https://leetcode.com', boxId: 'dev' },
    { title: 'Hacker News', url: 'https://news.ycombinator.com', boxId: 'dev' },

    // Quick Access
    { title: 'Google', url: 'https://google.com', boxId: 'quick-access' },
    { title: 'Wikipedia', url: 'https://wikipedia.org', boxId: 'quick-access' }
  ];

  // Default Built-in AI Launchpad Dock Apps (macOS Glass Vertical Dock)
  const DEFAULT_DOCK_APPS = [
    {
      id: 'chatgpt',
      title: 'ChatGPT',
      url: 'https://chatgpt.com',
      iconType: 'chatgpt'
    },
    {
      id: 'claude',
      title: 'Claude',
      url: 'https://claude.ai',
      iconType: 'claude'
    },
    {
      id: 'perplexity',
      title: 'Perplexity',
      url: 'https://www.perplexity.ai',
      iconType: 'perplexity'
    },
    {
      id: 'gemini',
      title: 'Gemini',
      url: 'https://gemini.google.com',
      iconType: 'gemini'
    }
  ];

  // State Management
  const state = {
    currentBg: null,
    wallpapers: (typeof WALLPAPER_CATALOG !== 'undefined' ? WALLPAPER_CATALOG.wallpapers : []),
    videos: (typeof WALLPAPER_CATALOG !== 'undefined' ? WALLPAPER_CATALOG.videos : []),
    boxes: JSON.parse(JSON.stringify(DEFAULT_BOXES)),
    customSites: JSON.parse(JSON.stringify(DEFAULT_CUSTOM_SITES)), // Strictly user-managed sites
    dockApps: JSON.parse(JSON.stringify(DEFAULT_DOCK_APPS)),
    dockPinned: false,
    dockEditing: false,
    siteBoxMapping: {}, // { [url]: boxId } user custom box assignment
    pinnedUrls: new Set(),
    hiddenUrls: new Set(),
    sortMode: 'rank', // 'rank' | 'alphabetical' | 'pinned'
    filterQuery: '',
    browserName: 'Tabwai',
    targetBoxForNewSite: 'productivity',
    wallhavenPage: 1,
    wallhavenQuery: 'toplist',
    wallhavenLoading: false,
    wallhavenItems: [],
    settings: {
      showClock: true,
      showSearch: true,
      use24h: false,
      showDate: true,
      showGreeting: true,
      autoCycle: false,
      searchEngine: 'google',
      openInNewTab: false,
      videoMuted: true,
      minVisitCount: 5, // minimum visits threshold to display (default 5)
      autoHistorySites: true,
      vignette: false,
      adaptiveClock: true,
      clockStyleMode: 'auto',
      superHdOnly: true,
      galleryQualityFilter: 'super-hd',
      lockWallpaper: false
    }
  };

  // DOM Elements
  const DOM = {
    bgVideo: document.getElementById('bg-video'),
    bgImagePrev: document.getElementById('bg-image-prev'),
    bgImage: document.getElementById('bg-image'),
    clockTime: document.getElementById('clock-time'),
    clockDate: document.getElementById('clock-date'),
    clockGreeting: document.getElementById('clock-greeting'),
    clockGreetingPill: document.getElementById('clock-greeting-pill'),
    clockContainer: document.getElementById('clock-container'),
    scrollCue: document.getElementById('scroll-cue'),
    minimalView: document.getElementById('minimal-view'),
    dashboardSection: document.getElementById('dashboard-section'),
    dashboardSubtitle: document.getElementById('dashboard-subtitle'),
    boxesContainer: document.getElementById('liquid-boxes-container'),
    sitesCount: document.getElementById('sites-count'),
    sitesEmptyState: document.getElementById('sites-empty-state'),
    btnScrollTop: document.getElementById('btn-scroll-top'),
    currentBgInfo: document.getElementById('current-bg-info'),
    // Editable Browser Name Box
    browserNameBox: document.getElementById('browser-name-box'),
    browserNameInput: document.getElementById('browser-name-input'),
    // Google Search Box Below Clock
    googleSearchForm: document.getElementById('google-search-form'),
    googleSearchInput: document.getElementById('google-search-input'),
    googleSearchClear: document.getElementById('google-search-clear'),
    // Top Action Buttons
    btnAddBox: document.getElementById('btn-add-box'),
    btnAddSite: document.getElementById('btn-add-site'),
    // Gallery Modal
    galleryModal: document.getElementById('gallery-modal'),
    galleryGrid: document.getElementById('gallery-grid'),
    galleryCloseBtn: document.getElementById('gallery-close-btn'),
    btnGallery: document.getElementById('btn-gallery'),
    btnGalleryRandom: document.getElementById('btn-gallery-random'),
    btnRandomBg: document.getElementById('btn-random-bg'),
    btnLockWallpaper: document.getElementById('btn-lock-wallpaper'),
    btnLockWallpaperGallery: document.getElementById('btn-lock-wallpaper-gallery'),
    galleryTabs: document.querySelectorAll('.gallery-tab'),
    curatedWallpapersToolbar: document.getElementById('curated-wallpapers-toolbar'),
    curatedTags: document.querySelectorAll('#curated-tags .wh-tag'),
    wallhavenToolbar: document.getElementById('wallhaven-toolbar'),
    wallhavenTags: document.querySelectorAll('#wallhaven-tags .wh-tag'),
    wallhavenLoadMoreWrap: document.getElementById('wallhaven-load-more-wrap'),
    btnWallhavenLoadMore: document.getElementById('btn-wallhaven-load-more'),
    // Settings Modal
    settingsModal: document.getElementById('settings-modal'),
    btnSettings: document.getElementById('btn-settings'),
    settingsCloseBtn: document.getElementById('settings-close-btn'),
    settingShowClock: document.getElementById('setting-show-clock'),
    settingShowSearch: document.getElementById('setting-show-search'),
    setting24hClock: document.getElementById('setting-24h-clock'),
    settingShowDate: document.getElementById('setting-show-date'),
    settingShowGreeting: document.getElementById('setting-show-greeting'),
    settingAdaptiveClock: document.getElementById('setting-adaptive-clock'),
    settingLockWallpaper: document.getElementById('setting-lock-wallpaper'),
    settingClockStyle: document.getElementById('setting-clock-style'),
    btnResetCache: document.getElementById('btn-reset-cache'),
    // Add Site Modal
    addSiteModal: document.getElementById('add-site-modal'),
    addSiteCloseBtn: document.getElementById('add-site-close-btn'),
    addSiteForm: document.getElementById('add-site-form'),
    inputSiteTitle: document.getElementById('input-site-title'),
    inputSiteUrl: document.getElementById('input-site-url'),
    selectSiteBox: document.getElementById('select-site-box'),
    btnCancelAddSite: document.getElementById('btn-cancel-add-site'),
    // Add Box Modal
    addBoxModal: document.getElementById('add-box-modal'),
    addBoxCloseBtn: document.getElementById('add-box-close-btn'),
    addBoxForm: document.getElementById('add-box-form'),
    inputBoxTitle: document.getElementById('input-box-title'),
    inputBoxIcon: document.getElementById('input-box-icon'),
    inputBoxColor: document.getElementById('input-box-color'),
    iconPickerGrid: document.getElementById('icon-picker-grid'),
    colorPickerGrid: document.getElementById('color-picker-grid'),
    btnCancelAddBox: document.getElementById('btn-cancel-add-box'),
    // Edit Box Modal
    editBoxModal: document.getElementById('edit-box-modal'),
    editBoxCloseBtn: document.getElementById('edit-box-close-btn'),
    editBoxForm: document.getElementById('edit-box-form'),
    inputEditBoxId: document.getElementById('edit-box-id'),
    inputEditBoxTitle: document.getElementById('input-edit-box-title'),
    inputEditBoxIcon: document.getElementById('input-edit-box-icon'),
    inputEditBoxColor: document.getElementById('input-edit-box-color'),
    editIconPickerGrid: document.getElementById('edit-icon-picker-grid'),
    editColorPickerGrid: document.getElementById('edit-color-picker-grid'),
    btnCancelEditBox: document.getElementById('btn-cancel-edit-box'),
    btnDeleteCurrentBox: document.getElementById('btn-delete-current-box'),
    // Incognito & Fullscreen
    btnIncognito: document.getElementById('btn-incognito'),
    btnToggleFullscreen: document.getElementById('btn-toggle-fullscreen'),
    // Ambient Soundscape Controls
    btnSoundscape: document.getElementById('btn-soundscape'),
    soundscapeActiveBadge: document.getElementById('soundscape-active-badge'),
    soundscapeFlyout: document.getElementById('soundscape-flyout'),
    soundscapeCloseBtn: document.getElementById('soundscape-close-btn'),
    btnSoundscapeToggle: document.getElementById('btn-soundscape-toggle'),
    soundscapeStatusText: document.getElementById('soundscape-status-text'),
    soundscapeTimerCountdown: document.getElementById('soundscape-timer-countdown'),
    soundscapeTimerLabel: document.getElementById('soundscape-timer-label'),
    soundscapePresets: document.querySelectorAll('#soundscape-presets .soundscape-card'),
    soundscapeVolume: document.getElementById('soundscape-volume'),
    soundscapeVolumeLabel: document.getElementById('soundscape-volume-label'),
    soundscapeTimerPills: document.querySelectorAll('#soundscape-timer-pills .timer-pill'),
    // macOS Left Glass AI Launchpad Dock
    macDockWrapper: document.getElementById('mac-dock-wrapper'),
    macDockHandle: document.getElementById('mac-dock-handle'),
    macDockShelf: document.getElementById('mac-dock-shelf'),
    btnDockPin: document.getElementById('btn-dock-pin'),
    dockItemsContainer: document.getElementById('dock-items-container'),
    btnDockAdd: document.getElementById('btn-dock-add'),
    btnDockEdit: document.getElementById('btn-dock-edit'),
    modalDockApp: document.getElementById('modal-dock-app'),
    dockModalTitle: document.getElementById('dock-modal-title'),
    dockModalClose: document.getElementById('dock-modal-close'),
    dockAppForm: document.getElementById('dock-app-form'),
    dockAppId: document.getElementById('dock-app-id'),
    dockAppTitle: document.getElementById('dock-app-title'),
    dockAppUrl: document.getElementById('dock-app-url'),
    dockAppIcon: document.getElementById('dock-app-icon'),
    btnCancelDockApp: document.getElementById('btn-cancel-dock-app'),
    // First-run Onboarding Banner Hint Toast
    bannerHintPopup: document.getElementById('banner-hint-popup'),
    bannerHintProgress: document.getElementById('banner-hint-progress'),
    btnCloseBannerHint: document.getElementById('btn-close-banner-hint')
  };

  /* ==========================================================================
     Storage & Initialization
     ========================================================================== */

  async function storageGet(keys) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
    } else {
      const res = {};
      keys.forEach((k) => {
        const val = localStorage.getItem('tabwai_' + k);
        if (val) {
          try { res[k] = JSON.parse(val); } catch (e) { res[k] = val; }
        }
      });
      return res;
    }
  }

  async function storageSet(data) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => chrome.storage.local.set(data, resolve));
    } else {
      Object.keys(data).forEach((k) => {
        localStorage.setItem('tabwai_' + k, JSON.stringify(data[k]));
      });
    }
  }

  async function init() {
    // 1. Synchronously restore cached styles to prevent any FOUC / flash of unstyled content
    try {
      const cachedStyle = localStorage.getItem('tabwai_clock_style');
      if (cachedStyle && DOM.clockContainer) {
        DOM.clockContainer.classList.toggle('style-capsule', cachedStyle === 'capsule');
      }
      const cachedTheme = localStorage.getItem('tabwai_clock_theme');
      if (cachedTheme === 'light') {
        document.body.classList.add('clock-theme-light');
        if (document.documentElement) document.documentElement.classList.add('clock-theme-light');
      }
    } catch (e) { }

    await loadSettingsAndPreferences();
    initClock();
    initBackground();
    fetchAndRenderBoxes();
    MacAiDockEngine.init();
    bindEvents();
    document.body.classList.remove('loading');
    document.body.classList.add('ready');
    checkAndShowBannerHint();
  }

  /* ==========================================================================
     Clock Engine
     ========================================================================== */

  function updateClock() {
    const now = new Date();

    // 1. Time (Clock)
    if (state.settings.showClock) {
      DOM.clockTime.style.display = 'block';
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      if (!state.settings.use24h) {
        hours = hours % 12 || 12;
      }
      DOM.clockTime.textContent = `${String(hours).padStart(2, '0')}:${minutes}`;
    } else {
      DOM.clockTime.style.display = 'none';
    }

    // 2. Current Date
    if (state.settings.showDate) {
      DOM.clockDate.style.display = 'block';
      const options = { weekday: 'long', month: 'long', day: 'numeric' };
      DOM.clockDate.textContent = now.toLocaleDateString(undefined, options);
    } else {
      DOM.clockDate.style.display = 'none';
    }

    // 3. Greeting Chip
    if (state.settings.showGreeting !== false) {
      if (DOM.clockGreetingPill) DOM.clockGreetingPill.style.display = 'inline-flex';
      const hour = now.getHours();
      let greeting = '';
      if (hour >= 5 && hour < 12) greeting = 'Good morning';
      else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
      else if (hour >= 17 && hour < 22) greeting = 'Good evening';
      else greeting = 'Good night';
      if (DOM.clockGreeting) DOM.clockGreeting.textContent = greeting;
    } else {
      if (DOM.clockGreetingPill) DOM.clockGreetingPill.style.display = 'none';
    }

    // 4. Google Search Box Below Clock
    if (DOM.googleSearchForm) {
      DOM.googleSearchForm.style.display = (state.settings.showSearch !== false) ? 'block' : 'none';
    }

    // 5. Container & Spacing Layout
    if (DOM.clockContainer) {
      DOM.clockContainer.classList.toggle('no-clock', !state.settings.showClock && !state.settings.showDate);
      const anyWidgetVisible = state.settings.showClock || state.settings.showDate || (state.settings.showGreeting !== false) || (state.settings.showSearch !== false);
      DOM.clockContainer.style.display = anyWidgetVisible ? 'flex' : 'none';
    }
  }

  function initClock() {
    updateClock();
    const activeStyleMode = state.settings.clockStyleMode || 'auto';
    applyClockStyle(activeStyleMode, lastDetectedIsLight);
    setInterval(updateClock, 1000);
  }

  /* ==========================================================================
     Adaptive Background Contrast & Clock Visibility Engine
     ========================================================================== */

  let lastAnalyzedSrc = null;
  let lastDetectedIsLight = false;

  function applyClockStyle(mode, isLightBg) {
    if (!DOM.clockContainer) return;

    // Only 'auto' (floating text) and 'capsule' (frosted glass pill) are supported
    const effectiveMode = (mode === 'capsule') ? 'capsule' : 'auto';
    DOM.clockContainer.classList.toggle('style-capsule', effectiveMode === 'capsule');

    try {
      localStorage.setItem('tabwai_clock_style', effectiveMode);
      if (document.documentElement) {
        document.documentElement.setAttribute('data-clock-style', effectiveMode);
      }
    } catch (e) { }

    // Adaptive contrast: auto-detect light/dark wallpaper for both modes
    const isLight = state.settings.adaptiveClock ? !!isLightBg : false;

    document.body.classList.toggle('clock-theme-light', isLight);
    if (document.documentElement) {
      document.documentElement.classList.toggle('clock-theme-light', isLight);
      document.documentElement.setAttribute('data-clock-theme', isLight ? 'light' : 'dark');
    }
    try {
      localStorage.setItem('tabwai_clock_theme', isLight ? 'light' : 'dark');
    } catch (e) { }
  }

  function detectWallpaperLuminance(src) {
    return new Promise((resolve) => {
      if (!src) {
        resolve(null);
        return;
      }

      const img = new Image();
      // Only set crossOrigin for remote HTTP(S) URLs to avoid local file security restrictions
      if (src.startsWith('http://') || src.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }

      let finished = false;
      const timer = setTimeout(() => {
        if (!finished) {
          finished = true;
          resolve(null);
        }
      }, 1800);

      const processImage = (imageEl) => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          const w = 120;
          const h = 80;
          canvas.width = w;
          canvas.height = h;

          const imgW = imageEl.naturalWidth || imageEl.width || 800;
          const imgH = imageEl.naturalHeight || imageEl.height || 600;

          // Sample upper 50% center where the clock numbers, date and greeting sit
          const sx = imgW * 0.15;
          const sy = imgH * 0.05;
          const sw = imgW * 0.70;
          const sh = imgH * 0.50;

          ctx.drawImage(imageEl, sx, sy, sw, sh, 0, 0, w, h);
          const imageData = ctx.getImageData(0, 0, w, h);
          const data = imageData.data;

          let totalLuminance = 0;
          let count = 0;

          for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Standard ITU-R BT.709 perceived luminance
            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            totalLuminance += lum;
            count++;
          }

          const avgLum = count > 0 ? (totalLuminance / count) : null;
          return avgLum;
        } catch (e) {
          return null;
        }
      };

      img.onload = async () => {
        if (finished) return;
        const result = processImage(img);
        if (result !== null) {
          finished = true;
          clearTimeout(timer);
          resolve(result);
        } else {
          // If tainted canvas due to CORS, fallback to extension fetch blob
          const blobLum = await fetchImageBlobLuminance(src);
          if (!finished) {
            finished = true;
            clearTimeout(timer);
            resolve(blobLum);
          }
        }
      };

      img.onerror = async () => {
        if (finished) return;
        const blobLum = await fetchImageBlobLuminance(src);
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          resolve(blobLum);
        }
      };

      img.src = src;
    });
  }

  async function fetchImageBlobLuminance(url) {
    try {
      if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
        return null;
      }
      const resp = await fetch(url, { mode: 'cors' });
      if (!resp.ok) return null;
      const blob = await resp.blob();
      const objUrl = URL.createObjectURL(blob);
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const w = 120;
            const h = 80;
            canvas.width = w;
            canvas.height = h;

            const imgW = img.naturalWidth || img.width || 800;
            const imgH = img.naturalHeight || img.height || 600;
            const sx = imgW * 0.15;
            const sy = imgH * 0.05;
            const sw = imgW * 0.70;
            const sh = imgH * 0.50;

            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
            const data = ctx.getImageData(0, 0, w, h).data;
            let total = 0, count = 0;
            for (let i = 0; i < data.length; i += 16) {
              total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
              count++;
            }
            URL.revokeObjectURL(objUrl);
            resolve(count > 0 ? (total / count) : null);
          } catch (err) {
            URL.revokeObjectURL(objUrl);
            resolve(null);
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(objUrl);
          resolve(null);
        };
        img.src = objUrl;
      });
    } catch (e) {
      return null;
    }
  }

  async function updateAdaptiveClockStyle(src, isVideo) {
    const mode = state.settings.clockStyleMode || 'auto';

    // Immediately apply capsule/auto mode with cached luminance to avoid FOUC
    applyClockStyle(mode, lastDetectedIsLight);

    if (!state.settings.adaptiveClock) {
      applyClockStyle(mode, false);
      return;
    }

    if (isVideo && !src) {
      lastDetectedIsLight = false;
      applyClockStyle(mode, false);
      return;
    }

    if (src && src === lastAnalyzedSrc) {
      applyClockStyle(mode, lastDetectedIsLight);
      return;
    }

    lastAnalyzedSrc = src;
    const lum = await detectWallpaperLuminance(src);
    const isLight = (lum !== null && lum >= 170);
    lastDetectedIsLight = isLight;
    applyClockStyle(mode, isLight);
  }

  /* ==========================================================================
     Background & Live Motion Engine (Slow Data & Zero-Bother Progressive Loading)
     ========================================================================== */

  let isSwitchingBg = false;
  let bgLoadAbortController = 0;

  function isSlowConnection() {
    if (!navigator.onLine) return true;
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return false;
    if (conn.saveData) return true;
    const slowTypes = ['slow-2g', '2g', '3g'];
    if (slowTypes.includes(conn.effectiveType)) return true;
    if (typeof conn.downlink === 'number' && conn.downlink < 1.8) return true;
    if (typeof conn.rtt === 'number' && conn.rtt > 500) return true;
    return false;
  }

  function getLocalFallbackWallpaper() {
    const localList = state.wallpapers.filter((w) => w.src && w.src.startsWith('assets/'));
    if (localList.length > 0) {
      return localList[Math.floor(Math.random() * localList.length)];
    }
    return {
      id: 'wp-alpine-sunset',
      title: 'Alpine Sunset',
      src: 'assets/wallpapers/4k-alpine-sunset.jpg',
      thumb: 'assets/wallpapers/thumbs/4k-alpine-sunset.jpg'
    };
  }

  function preloadImage(src, timeoutMs = 7000) {
    return new Promise((resolve, reject) => {
      if (!src) { reject(new Error('No src')); return; }
      const img = new Image();
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        reject(new Error('Image preload timeout'));
      }, timeoutMs);

      img.onload = () => {
        if (timedOut) return;
        clearTimeout(timer);
        if ('decode' in img) {
          img.decode().then(() => resolve(src)).catch(() => resolve(src));
        } else {
          resolve(src);
        }
      };

      img.onerror = (err) => {
        if (timedOut) return;
        clearTimeout(timer);
        reject(err || new Error('Image load failed'));
      };

      img.src = src;
    });
  }

  async function applyBackground(item, isVideo) {
    if (!item) return;

    const thisLoadId = ++bgLoadAbortController;

    if (isVideo) {
      if (DOM.bgVideo) {
        DOM.bgImage.classList.remove('active', 'is-preview');
        if (DOM.bgImagePrev) DOM.bgImagePrev.classList.remove('active');
        DOM.bgVideo.src = item.src;
        if (item.poster) DOM.bgVideo.poster = item.poster;
        DOM.bgVideo.muted = state.settings.videoMuted;
        DOM.bgVideo.play().catch(() => {
          DOM.bgVideo.muted = true;
          DOM.bgVideo.play().catch(() => { });
        });
        DOM.bgVideo.classList.add('active');
        state.currentBg = { type: 'video', id: item.id, title: item.title, poster: item.poster };
      }
    } else {
      if (DOM.bgVideo) {
        DOM.bgVideo.pause();
        DOM.bgVideo.classList.remove('active');
      }

      const isLocal = item.src && (item.src.startsWith('assets/') || !item.src.startsWith('http'));

      // Keep previous wallpaper visible on bgImagePrev so the screen NEVER flashes black during download
      if (DOM.bgImagePrev && DOM.bgImage && DOM.bgImage.style.backgroundImage) {
        DOM.bgImagePrev.style.backgroundImage = DOM.bgImage.style.backgroundImage;
        DOM.bgImagePrev.classList.add('active');
      }

      if (isLocal) {
        // Bundled local file: Loads in 1-2ms with zero network usage
        DOM.bgImage.classList.remove('is-preview');
        DOM.bgImage.style.backgroundImage = `url("${item.src}")`;
        DOM.bgImage.classList.add('active');
        setTimeout(() => {
          if (DOM.bgImagePrev) DOM.bgImagePrev.classList.remove('active');
        }, 400);
        state.currentBg = { type: 'image', id: item.id, title: item.title, src: item.src, thumb: item.thumb };
      } else {
        // Remote / Online Wallpaper (e.g. Wallhaven 4K/8K)
        const slow = isSlowConnection();
        const timeout = slow ? 4500 : 8000;

        // Stage 1 (Progressive LQIP): Instantly display compressed thumbnail in ~50ms
        if (item.thumb) {
          DOM.bgImage.style.backgroundImage = `url("${item.thumb}")`;
          DOM.bgImage.classList.add('active', 'is-preview');
        }

        try {
          // Stage 2: Off-screen preloading of full 4K resolution
          await preloadImage(item.src, timeout);

          if (thisLoadId !== bgLoadAbortController) return;

          DOM.bgImage.style.backgroundImage = `url("${item.src}")`;
          DOM.bgImage.classList.remove('is-preview');
          DOM.bgImage.classList.add('active');
          setTimeout(() => {
            if (DOM.bgImagePrev) DOM.bgImagePrev.classList.remove('active');
          }, 400);

          state.currentBg = { type: 'image', id: item.id, title: item.title, src: item.src, thumb: item.thumb };
        } catch (err) {
          if (thisLoadId !== bgLoadAbortController) return;

          // If slow connection or network drop, keep preview or smoothly fallback to a local 4K wallpaper
          if (item.thumb) {
            DOM.bgImage.classList.remove('is-preview');
            state.currentBg = { type: 'image', id: item.id, title: item.title, src: item.thumb, thumb: item.thumb };
          } else {
            const fallback = getLocalFallbackWallpaper();
            DOM.bgImage.classList.remove('is-preview');
            DOM.bgImage.style.backgroundImage = `url("${fallback.src}")`;
            DOM.bgImage.classList.add('active');
            state.currentBg = { type: 'image', id: fallback.id, title: fallback.title, src: fallback.src, thumb: fallback.thumb };
          }

          setTimeout(() => {
            if (DOM.bgImagePrev) DOM.bgImagePrev.classList.remove('active');
          }, 400);
        }
      }
    }

    if (DOM.currentBgInfo) {
      DOM.currentBgInfo.textContent = `${item.title} (${isVideo ? 'Live Video' : '4K Static'})`;
    }

    storageSet({ currentBg: state.currentBg });

    // Automatically adapt clock style and contrast to the new background
    const sampleSrc = isVideo ? (item.poster || null) : (item.thumb || item.src);
    updateAdaptiveClockStyle(sampleSrc, isVideo);
  }

  /* ==========================================================================
     Wallpaper Quality & Resolution Filter Engine
     ========================================================================== */

  function getWallpaperDimensions(item) {
    if (!item) return { width: 0, height: 0, isLandscape: false };
    if (item.dimension_x && item.dimension_y) {
      const w = parseInt(item.dimension_x, 10) || 0;
      const h = parseInt(item.dimension_y, 10) || 0;
      return { width: w, height: h, isLandscape: w >= h };
    }
    const resStr = (item.resolution || '').replace(/\s+/g, '');
    const match = resStr.match(/(\d{3,5})[\u00d7xX](\d{3,5})/);
    if (match) {
      const w = parseInt(match[1], 10) || 0;
      const h = parseInt(match[2], 10) || 0;
      return { width: w, height: h, isLandscape: w >= h };
    }
    if (/8k|5k|4k/i.test(item.resolution || '') || /8k|5k|4k/i.test(item.title || '')) {
      return { width: 3840, height: 2160, isLandscape: true };
    }
    if (/2k|qhd|1440p/i.test(item.resolution || '') || /2k|qhd/i.test(item.title || '')) {
      return { width: 2560, height: 1440, isLandscape: true };
    }
    return { width: 1920, height: 1080, isLandscape: true };
  }

  function isSuperHdWallpaper(item, filterMode = 'super-hd') {
    if (!item) return false;
    if (filterMode === 'all') return true;
    if (item.isVideo || item.duration || item.type === 'video') return true;

    const { width, height, isLandscape } = getWallpaperDimensions(item);
    if (!isLandscape) return false;

    if (filterMode === '4k-only') {
      return (width >= 3800 && height >= 2000) || /8k|5k|4k/i.test(item.resolution || '');
    }

    return (width >= 2560 && height >= 1400) || /8k|5k|4k|2k|qhd|1440p/i.test(item.resolution || '');
  }

  function getRandomBackground() {
    const slow = isSlowConnection();
    const qualityMode = state.settings.superHdOnly ? 'super-hd' : (state.settings.galleryQualityFilter || 'all');

    // On slow data or offline, prefer bundled 4K local wallpapers for instant 0-data loading
    if (slow) {
      const localPool = state.wallpapers.filter((w) => w.src && w.src.startsWith('assets/'));
      if (localPool.length > 0) {
        return localPool[Math.floor(Math.random() * localPool.length)];
      }
    }

    let pool = [
      ...state.videos.map((v) => ({ ...v, isVideo: true })),
      ...state.wallpapers.map((w) => ({ ...w, isVideo: false }))
    ];

    if (state.settings.superHdOnly) {
      const filtered = pool.filter((w) => isSuperHdWallpaper(w, qualityMode));
      if (filtered.length > 0) pool = filtered;
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  let toastTimer = null;
  function showToast(msg) {
    let toast = document.getElementById('tabwai-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'tabwai-toast';
      toast.className = 'tabwai-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  function updateWallpaperLockUI(isLocked) {
    const locked = !!isLocked;

    if (DOM.btnLockWallpaperGallery) {
      DOM.btnLockWallpaperGallery.classList.toggle('locked', locked);
      const iconUn = DOM.btnLockWallpaperGallery.querySelector('.icon-unlocked');
      const iconLk = DOM.btnLockWallpaperGallery.querySelector('.icon-locked');
      if (iconUn) iconUn.classList.toggle('hidden', locked);
      if (iconLk) iconLk.classList.toggle('hidden', !locked);
      const label = DOM.btnLockWallpaperGallery.querySelector('.lock-label');
      if (label) label.textContent = locked ? 'Wallpaper Locked' : 'Lock Wallpaper';
      DOM.btnLockWallpaperGallery.title = locked ? 'Wallpaper is locked (Click to unlock)' : 'Lock current wallpaper (prevents it from changing)';
    }

    if (DOM.btnLockWallpaper) {
      DOM.btnLockWallpaper.classList.toggle('is-locked', locked);
      const iconUn = DOM.btnLockWallpaper.querySelector('.icon-unlocked');
      const iconLk = DOM.btnLockWallpaper.querySelector('.icon-locked');
      if (iconUn) iconUn.classList.toggle('hidden', locked);
      if (iconLk) iconLk.classList.toggle('hidden', !locked);
      DOM.btnLockWallpaper.title = locked ? 'Wallpaper is locked (Click to unlock)' : 'Lock Current Wallpaper (Shortcut: L)';
    }

    if (DOM.settingLockWallpaper) {
      DOM.settingLockWallpaper.checked = locked;
    }

    if (DOM.btnRandomBg) {
      DOM.btnRandomBg.classList.toggle('is-locked', locked);
      DOM.btnRandomBg.title = locked ? 'Wallpaper is locked. Click lock icon to unlock.' : 'Cycle Random Background (Shortcut: W)';
    }
  }

  function toggleWallpaperLock() {
    state.settings.lockWallpaper = !state.settings.lockWallpaper;
    storageSet({ settings: state.settings });
    try {
      localStorage.setItem('tabwai_wallpaper_locked', state.settings.lockWallpaper ? 'true' : 'false');
    } catch (e) { }

    updateWallpaperLockUI(state.settings.lockWallpaper);
    showToast(state.settings.lockWallpaper ? '🔒 Wallpaper locked (will not change)' : '🔓 Wallpaper unlocked');
  }

  async function cycleRandomBackground() {
    if (state.settings.lockWallpaper) {
      showToast('🔒 Wallpaper is locked. Unlock to change.');
      return;
    }
    if (isSwitchingBg) return;
    isSwitchingBg = true;

    if (DOM.btnRandomBg) {
      DOM.btnRandomBg.classList.add('is-spinning');
      DOM.btnRandomBg.setAttribute('disabled', 'true');
    }

    try {
      const randomItem = getRandomBackground();
      await applyBackground(randomItem, randomItem.isVideo);
    } finally {
      setTimeout(() => {
        if (DOM.btnRandomBg) {
          DOM.btnRandomBg.classList.remove('is-spinning');
          DOM.btnRandomBg.removeAttribute('disabled');
        }
        isSwitchingBg = false;
      }, 400);
    }
  }

  async function initBackground() {
    if (state.settings.lockWallpaper && state.currentBg) {
      if (state.currentBg.type === 'video') {
        const item = state.videos.find((v) => v.id === state.currentBg.id);
        if (item) { await applyBackground(item, true); return; }
      } else {
        const item = state.wallpapers.find((w) => w.id === state.currentBg.id);
        if (item) { await applyBackground(item, false); return; }
        if (state.currentBg.src) {
          await applyBackground({ id: state.currentBg.id, title: state.currentBg.title, src: state.currentBg.src, thumb: state.currentBg.thumb }, false);
          return;
        }
      }
    }

    if (state.settings.autoCycle && !state.settings.lockWallpaper) {
      await cycleRandomBackground();
      return;
    }

    const qualityMode = state.settings.superHdOnly ? 'super-hd' : 'all';

    if (state.currentBg) {
      if (state.currentBg.type === 'video') {
        const item = state.videos.find((v) => v.id === state.currentBg.id);
        if (item) { await applyBackground(item, true); return; }
      } else {
        const item = state.wallpapers.find((w) => w.id === state.currentBg.id);
        if (item && (!state.settings.superHdOnly || isSuperHdWallpaper(item, qualityMode))) {
          await applyBackground(item, false);
          return;
        } else if (state.currentBg.src && (!state.settings.superHdOnly || isSuperHdWallpaper(state.currentBg, qualityMode))) {
          await applyBackground({ id: state.currentBg.id, title: state.currentBg.title, src: state.currentBg.src, thumb: state.currentBg.thumb }, false);
          return;
        }
      }
    }

    // Default: Pick a crisp Super HD wallpaper or Live motion video
    await cycleRandomBackground();
  }

  /* ==========================================================================
     Liquid Rectangle Boxes & Auto-Categorization Engine
     ========================================================================== */

  function getDomain(urlStr) {
    try {
      const url = new URL(urlStr);
      return url.hostname.replace(/^www\./, '');
    } catch (e) {
      return urlStr;
    }
  }

  function getFaviconUrl(urlStr) {
    const domain = getDomain(urlStr);
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  }

  // Domain Classifier: maps domains to box IDs
  function detectCategory(urlStr, title = '') {
    const domain = getDomain(urlStr).toLowerCase();
    const t = (title || '').toLowerCase();

    // Social & Community
    if (
      domain.includes('twitter.com') ||
      domain.includes('x.com') ||
      domain.includes('reddit.com') ||
      domain.includes('instagram.com') ||
      domain.includes('discord.com') ||
      domain.includes('linkedin.com') ||
      domain.includes('facebook.com') ||
      domain.includes('threads.net') ||
      domain.includes('whatsapp.com') ||
      domain.includes('telegram.org') ||
      domain.includes('pinterest.com')
    ) {
      return 'social';
    }

    // Media & Entertainment
    if (
      domain.includes('youtube.com') ||
      domain.includes('youtu.be') ||
      domain.includes('netflix.com') ||
      domain.includes('spotify.com') ||
      domain.includes('twitch.tv') ||
      domain.includes('primevideo.com') ||
      domain.includes('hulu.com') ||
      domain.includes('disneyplus.com') ||
      domain.includes('soundcloud.com') ||
      domain.includes('music.apple.com') ||
      domain.includes('crunchyroll.com')
    ) {
      return 'entertainment';
    }

    // Developer & Tools
    if (
      domain.includes('stackoverflow.com') ||
      domain.includes('developer.mozilla.org') ||
      domain.includes('leetcode.com') ||
      domain.includes('hackernews.com') ||
      domain.includes('ycombinator.com') ||
      domain.includes('npmjs.com') ||
      domain.includes('pypi.org') ||
      domain.includes('codepen.io') ||
      domain.includes('dev.to') ||
      domain.includes('medium.com') ||
      domain.includes('w3schools.com')
    ) {
      return 'dev';
    }

    // Productivity & Workspace
    if (
      domain.includes('github.com') ||
      domain.includes('gitlab.com') ||
      domain.includes('chatgpt.com') ||
      domain.includes('openai.com') ||
      domain.includes('claude.ai') ||
      domain.includes('anthropic.com') ||
      domain.includes('notion.so') ||
      domain.includes('figma.com') ||
      domain.includes('docs.google.com') ||
      domain.includes('drive.google.com') ||
      domain.includes('mail.google.com') ||
      domain.includes('slack.com') ||
      domain.includes('linear.app') ||
      domain.includes('jira.com') ||
      domain.includes('trello.com') ||
      domain.includes('localhost') ||
      domain.includes('127.0.0.1') ||
      t.includes('antigravity') ||
      t.includes('docs')
    ) {
      return 'productivity';
    }

    return 'quick-access';
  }

  function cleanSiteTitle(rawTitle, domain) {
    if (!rawTitle || rawTitle.trim() === '') {
      const cleanDomain = domain.replace(/\.(com|org|net|io|co|app|dev|ai|edu|gov|xyz|in)$/i, '');
      return cleanDomain.charAt(0).toUpperCase() + cleanDomain.slice(1);
    }
    let t = rawTitle.trim();
    t = t.replace(/^\(\d+\)\s*/, '').replace(/^\[\d+\]\s*/, '');
    return t;
  }

  function fetchAndRenderBoxes() {
    if (DOM.dashboardSubtitle) {
      DOM.dashboardSubtitle.textContent = 'Custom workspace boxes & bookmarks';
    }
    renderBoxes();
  }

  function getProcessedSitesForBoxes() {
    // 1. Map of boxId -> list of sites
    const boxSitesMap = {};
    state.boxes.forEach((b) => { boxSitesMap[b.id] = []; });

    const seenUrls = new Set();

    // Helper to add site if not seen and not hidden
    function addSiteToBox(site, defaultBoxId) {
      if (!site || !site.url) return;
      const cleanUrl = site.url.replace(/\/+$/, '').toLowerCase();
      if (seenUrls.has(cleanUrl) || state.hiddenUrls.has(site.url)) return;
      seenUrls.add(cleanUrl);

      // Determine box: custom user override > site.boxId > defaultBoxId
      let targetBoxId = state.siteBoxMapping[site.url] || site.boxId || defaultBoxId || detectCategory(site.url, site.title);
      if (!boxSitesMap[targetBoxId]) {
        targetBoxId = state.boxes[0] ? state.boxes[0].id : 'productivity';
      }

      // STRICT HARD LIMIT: Cap each box at exactly 4 sites maximum
      if (boxSitesMap[targetBoxId] && boxSitesMap[targetBoxId].length >= 4) {
        return;
      }

      boxSitesMap[targetBoxId].push({
        title: site.title || getDomain(site.url),
        url: site.url,
        boxId: targetBoxId,
        isPinned: state.pinnedUrls.has(site.url)
      });
    }

    // ONLY process user-stored shortcuts (customSites)
    state.customSites.forEach((s) => addSiteToBox(s, s.boxId));

    return boxSitesMap;
  }

  function renderBoxes() {
    const boxSitesMap = getProcessedSitesForBoxes();
    DOM.boxesContainer.innerHTML = '';

    let totalVisibleSites = 0;
    const filter = state.filterQuery.trim().toLowerCase();

    state.boxes.forEach((box) => {
      let sites = (boxSitesMap[box.id] || []).slice(0, 4);

      // Filter query across sites
      if (filter) {
        sites = sites.filter((s) => {
          return (
            (s.title && s.title.toLowerCase().includes(filter)) ||
            (s.url && s.url.toLowerCase().includes(filter)) ||
            getDomain(s.url).toLowerCase().includes(filter) ||
            box.title.toLowerCase().includes(filter)
          );
        });
      }

      // Sort
      if (state.sortMode === 'alphabetical') {
        sites.sort((a, b) => a.title.localeCompare(b.title));
      } else if (state.sortMode === 'pinned') {
        sites.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
      }

      // STRICT LIMIT: Exactly 4 sites maximum
      sites = sites.slice(0, 4);
      totalVisibleSites += sites.length;
      const isFull = sites.length >= 4;

      // Create Liquid Rectangle Box Element
      const boxElem = document.createElement('div');
      boxElem.className = `liquid-box theme-${box.color || 'cyan'} ${isFull ? 'box-full' : ''}`;
      boxElem.dataset.boxId = box.id;

      boxElem.innerHTML = `
        <div class="box-header">
          <div class="box-title-group" title="Click to rename or edit ${box.title}">
            <div class="box-icon-wrap">${box.icon || '📌'}</div>
            <h3 class="box-title">${box.title}</h3>
            <span class="box-count ${isFull ? 'box-full' : ''}">${sites.length}/4</span>
          </div>
          <div class="box-controls">
            <button class="box-action-btn btn-box-add-site ${isFull ? 'is-full' : ''}" ${isFull ? 'disabled' : ''} title="${isFull ? 'Box is full (maximum 4 sites allowed)' : `Add site to ${box.title}`}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>${isFull ? 'Full' : 'Add'}</span>
            </button>
            <button class="box-header-icon-btn btn-box-edit" title="Rename or Edit ${box.title}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="box-header-icon-btn btn-box-delete" title="Delete ${box.title}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>

        <div class="box-sites-grid">
          <!-- Cards injected here -->
        </div>
      `;

      boxElem.dataset.boxId = box.id;

      // Drag & Drop Liquid Target Support
      boxElem.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        boxElem.classList.add('liquid-drop-active');
      });

      boxElem.addEventListener('dragleave', (e) => {
        if (!boxElem.contains(e.relatedTarget)) {
          boxElem.classList.remove('liquid-drop-active');
        }
      });

      boxElem.addEventListener('drop', (e) => {
        e.preventDefault();
        boxElem.classList.remove('liquid-drop-active');
        const url = e.dataTransfer.getData('text/plain');
        const sourceBoxId = e.dataTransfer.getData('source-box');
        if (url && sourceBoxId && sourceBoxId !== box.id) {
          const currentCount = (boxSitesMap[box.id] || []).length;
          if (currentCount >= 4) {
            alert(`"${box.title}" already contains the maximum limit of 4 shortcuts.`);
            return;
          }
          const sourceCardEl = document.querySelector(`.site-card[data-url="${CSS.escape(url)}"]`);
          moveSiteToBox(url, box.id, sourceCardEl);
        }
      });

      const sitesGrid = boxElem.querySelector('.box-sites-grid');

      // Populate cards (strictly up to 4 cards)
      sites.forEach((site) => {
        const card = createSiteCard(site, box);
        sitesGrid.appendChild(card);
      });

      // Box Action: Add Site in Header
      const boxAddBtn = boxElem.querySelector('.btn-box-add-site');
      if (boxAddBtn) {
        boxAddBtn.addEventListener('click', () => {
          if (sites.length >= 4) {
            alert(`"${box.title}" is full (maximum 4 shortcuts allowed). Please delete or move an existing site first, or click "+ Add Box" to create a new category.`);
            return;
          }
          openAddSiteModalForBox(box.id);
        });
      }

      // Box Action: Edit / Rename Box (Click on edit button or title)
      const boxEditBtn = boxElem.querySelector('.btn-box-edit');
      boxEditBtn.addEventListener('click', () => {
        openEditBoxModal(box);
      });
      const boxTitleGroup = boxElem.querySelector('.box-title-group');
      boxTitleGroup.style.cursor = 'pointer';
      boxTitleGroup.addEventListener('click', () => {
        openEditBoxModal(box);
      });

      // Box Action: Delete Box
      const boxDelBtn = boxElem.querySelector('.btn-box-delete');
      boxDelBtn.addEventListener('click', () => {
        deleteBox(box.id);
      });

      DOM.boxesContainer.appendChild(boxElem);
    });

    DOM.sitesCount.textContent = `${totalVisibleSites}`;
    DOM.sitesEmptyState.classList.toggle('hidden', totalVisibleSites > 0);
  }

  function createSiteCard(site, currentBox) {
    const card = document.createElement('a');
    card.className = 'liquid-card';
    card.href = site.url;
    if (state.settings.openInNewTab) {
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }

    const domain = getDomain(site.url);
    const faviconUrl = getFaviconUrl(site.url);
    const initial = (site.title || domain || 'S').trim().charAt(0).toUpperCase();

    card.innerHTML = `
      <div class="site-chip-left">
        <div class="favicon-wrapper">
          <img class="site-favicon" src="${faviconUrl}" alt="${site.title}" loading="lazy">
          <span class="fallback-monogram" style="display: none;">${initial}</span>
        </div>
        <span class="site-title" title="${site.title} (${domain})">${site.title}</span>
      </div>
      <div class="card-badges">
        <button class="move-btn" title="Move to another box" data-url="${site.url}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        </button>
        <button class="pin-icon-btn ${site.isPinned ? 'pinned' : ''}" title="${site.isPinned ? 'Unpin' : 'Pin'}" data-url="${site.url}">
          <svg viewBox="0 0 24 24" fill="${site.isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M12 17v5M5 17h14l-2-6V4h1V2H6v2h1v7l-2 6z"/></svg>
        </button>
        <button class="delete-icon-btn" title="Delete shortcut" data-url="${site.url}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Context Menu for Move to Box -->
      <div class="move-menu" id="move-menu-${encodeURIComponent(site.url)}">
        <!-- populated on click -->
      </div>
    `;

    // Handle Favicon fallback
    const img = card.querySelector('.site-favicon');
    const monogram = card.querySelector('.fallback-monogram');
    img.onerror = () => {
      img.style.display = 'none';
      monogram.style.display = 'block';
    };

    card.setAttribute('draggable', 'true');
    card.dataset.url = site.url;
    card.dataset.boxId = currentBox.id;

    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', site.url);
      e.dataTransfer.setData('source-box', currentBox.id);
      e.dataTransfer.effectAllowed = 'move';
      card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      document.querySelectorAll('.liquid-box.liquid-drop-active').forEach((b) => b.classList.remove('liquid-drop-active'));
    });

    // Card Action: Move to Box
    const moveBtn = card.querySelector('.move-btn');
    const moveMenu = card.querySelector('.move-menu');

    moveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Close all other move menus
      document.querySelectorAll('.move-menu.open').forEach((m) => {
        if (m !== moveMenu) m.classList.remove('open');
      });

      moveMenu.innerHTML = '';
      const boxSitesMap = getProcessedSitesForBoxes();
      state.boxes.forEach((targetBox) => {
        if (targetBox.id === currentBox.id) return;
        const targetSitesCount = (boxSitesMap[targetBox.id] || []).length;
        const isFull = targetSitesCount >= 4;
        const item = document.createElement('button');
        item.className = `move-menu-item ${isFull ? 'disabled' : ''}`;
        item.innerHTML = `<span>${targetBox.icon || '📌'}</span><span>${targetBox.title} ${isFull ? '(Full - 4/4)' : `(${targetSitesCount}/4)`}</span>`;
        if (isFull) {
          item.disabled = true;
          item.style.opacity = '0.4';
          item.style.cursor = 'not-allowed';
          item.title = `"${targetBox.title}" is full (maximum 4 sites reached)`;
        } else {
          item.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            moveSiteToBox(site.url, targetBox.id, card);
            moveMenu.classList.remove('open');
          });
        }
        moveMenu.appendChild(item);
      });

      moveMenu.classList.toggle('open');
    });

    // Card Action: Pin button
    const pinBtn = card.querySelector('.pin-icon-btn');
    pinBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePinSite(site.url);
    });

    // Card Action: Delete / Hide button
    const delBtn = card.querySelector('.delete-icon-btn');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        hideSite(site.url);
      });
    }

    return card;
  }

  function moveSiteToBox(url, targetBoxId, sourceCardEl = null) {
    const boxSitesMap = getProcessedSitesForBoxes();
    const targetSites = boxSitesMap[targetBoxId] || [];
    const isAlreadyThere = targetSites.some((s) => s.url === url);
    if (!isAlreadyThere && targetSites.length >= 4) {
      const targetBox = state.boxes.find((b) => b.id === targetBoxId);
      alert(`Cannot move to "${targetBox ? targetBox.title : 'this box'}" because it already has the maximum of 4 shortcuts.`);
      return;
    }

    if (!sourceCardEl) {
      sourceCardEl = document.querySelector(`.liquid-card[data-url="${CSS.escape(url)}"]`);
    }

    const targetBoxEl = document.querySelector(`.liquid-box[data-box-id="${targetBoxId}"]`);

    if (sourceCardEl && targetBoxEl) {
      // Liquid Morph Transition Animation
      const fromRect = sourceCardEl.getBoundingClientRect();
      const toRect = targetBoxEl.getBoundingClientRect();

      const clone = sourceCardEl.cloneNode(true);
      clone.classList.remove('dragging');
      clone.classList.add('liquid-morph-clone');

      const badges = clone.querySelector('.card-badges');
      if (badges) badges.remove();
      const menu = clone.querySelector('.move-menu');
      if (menu) menu.remove();

      clone.style.left = `${fromRect.left}px`;
      clone.style.top = `${fromRect.top}px`;
      clone.style.width = `${fromRect.width}px`;
      clone.style.height = `${fromRect.height}px`;

      document.body.appendChild(clone);
      sourceCardEl.classList.add('liquid-source-collapsing');

      const grid = targetBoxEl.querySelector('.box-sites-grid');
      const gridRect = grid ? grid.getBoundingClientRect() : toRect;
      const destX = gridRect.left + 8;
      const destY = gridRect.top + 8;

      // Force layout before transition
      clone.getBoundingClientRect();

      // Animate clone along curved liquid trajectory
      clone.style.left = `${destX}px`;
      clone.style.top = `${destY}px`;
      clone.style.transform = 'scale(1.05) rotate(2deg)';
      targetBoxEl.classList.add('liquid-box-receiving');

      setTimeout(() => {
        clone.style.transform = 'scale(0.94) rotate(0deg)';
        clone.style.opacity = '0';

        setTimeout(() => {
          if (clone.parentNode) clone.parentNode.removeChild(clone);
          targetBoxEl.classList.remove('liquid-box-receiving');

          state.siteBoxMapping[url] = targetBoxId;
          storageSet({ siteBoxMapping: state.siteBoxMapping });
          renderBoxes();

          // Liquid Pop effect on newly rendered card
          requestAnimationFrame(() => {
            const arrivedCard = document.querySelector(`.liquid-box[data-box-id="${targetBoxId}"] .liquid-card[data-url="${CSS.escape(url)}"]`);
            if (arrivedCard) {
              arrivedCard.classList.add('liquid-card-arrived');
            }
          });
        }, 60);
      }, 340);
    } else {
      state.siteBoxMapping[url] = targetBoxId;
      storageSet({ siteBoxMapping: state.siteBoxMapping });
      renderBoxes();
    }
  }

  function togglePinSite(url) {
    if (state.pinnedUrls.has(url)) {
      state.pinnedUrls.delete(url);
    } else {
      state.pinnedUrls.add(url);
    }
    storageSet({ pinnedUrls: Array.from(state.pinnedUrls) });
    renderBoxes();
  }

  function hideSite(url) {
    state.hiddenUrls.add(url);
    state.customSites = state.customSites.filter((s) => s.url !== url);
    storageSet({
      hiddenUrls: Array.from(state.hiddenUrls),
      customSites: state.customSites
    });
    renderBoxes();
  }

  function deleteBox(boxId) {
    if (state.boxes.length <= 1) {
      alert('You must keep at least one liquid box.');
      return;
    }

    const box = state.boxes.find((b) => b.id === boxId);
    const boxTitle = box ? box.title : 'this box';
    const remainingBox = state.boxes.find((b) => b.id !== boxId);
    const targetName = remainingBox ? remainingBox.title : 'another box';

    if (confirm(`Delete the "${boxTitle}" box?\n\nAny sites in this box will be safely moved to "${targetName}".`)) {
      state.boxes = state.boxes.filter((b) => b.id !== boxId);

      const targetId = remainingBox ? remainingBox.id : 'productivity';
      Object.keys(state.siteBoxMapping).forEach((url) => {
        if (state.siteBoxMapping[url] === boxId) {
          state.siteBoxMapping[url] = targetId;
        }
      });
      state.customSites.forEach((s) => {
        if (s.boxId === boxId) s.boxId = targetId;
      });

      storageSet({
        boxes: state.boxes,
        siteBoxMapping: state.siteBoxMapping,
        customSites: state.customSites
      });
      renderBoxes();
      if (DOM.editBoxModal.classList.contains('open')) {
        closeModal(DOM.editBoxModal);
      }
    }
  }

  function openEditBoxModal(box) {
    if (!box) return;
    DOM.inputEditBoxId.value = box.id;
    DOM.inputEditBoxTitle.value = box.title;
    DOM.inputEditBoxIcon.value = box.icon || '⚡';
    DOM.inputEditBoxColor.value = box.color || 'cyan';

    DOM.editIconPickerGrid.querySelectorAll('.icon-choice').forEach((b) => {
      b.classList.toggle('active', b.dataset.icon === (box.icon || '⚡'));
    });
    DOM.editColorPickerGrid.querySelectorAll('.color-choice').forEach((b) => {
      b.classList.toggle('active', b.dataset.color === (box.color || 'cyan'));
    });

    openModal(DOM.editBoxModal);
    setTimeout(() => DOM.inputEditBoxTitle.focus(), 150);
  }

  /* ==========================================================================
     Add Site & Add Box Modals
     ========================================================================== */

  function updateBoxSelectDropdown(preselectedBoxId) {
    DOM.selectSiteBox.innerHTML = '';
    const boxSitesMap = getProcessedSitesForBoxes();
    let firstAvailableBoxId = null;

    state.boxes.forEach((box) => {
      const count = (boxSitesMap[box.id] || []).length;
      const isFull = count >= 4;
      const opt = document.createElement('option');
      opt.value = box.id;
      if (isFull) {
        opt.disabled = true;
        opt.textContent = `${box.icon || '📌'} ${box.title} (Full - 4/4)`;
      } else {
        if (!firstAvailableBoxId) firstAvailableBoxId = box.id;
        opt.textContent = `${box.icon || '📌'} ${box.title} (${count}/4)`;
      }
      if (box.id === preselectedBoxId && !isFull) {
        opt.selected = true;
      }
      DOM.selectSiteBox.appendChild(opt);
    });

    if (preselectedBoxId && (boxSitesMap[preselectedBoxId] || []).length >= 4) {
      if (firstAvailableBoxId) {
        DOM.selectSiteBox.value = firstAvailableBoxId;
      }
    }
  }

  function openAddSiteModalForBox(boxId = 'productivity') {
    const boxSitesMap = getProcessedSitesForBoxes();
    const count = (boxSitesMap[boxId] || []).length;
    if (count >= 4) {
      const box = state.boxes.find((b) => b.id === boxId);
      alert(`"${box ? box.title : 'This box'}" already has the maximum of 4 shortcuts. Choose another box or click "+ Add Box" to create a new category.`);
      return;
    }
    state.targetBoxForNewSite = boxId;
    updateBoxSelectDropdown(boxId);
    openModal(DOM.addSiteModal);
    setTimeout(() => DOM.inputSiteTitle.focus(), 150);
  }

  function openAddBoxModal() {
    DOM.addBoxForm.reset();
    DOM.inputBoxIcon.value = '⚡';
    DOM.inputBoxColor.value = 'cyan';
    DOM.iconPickerGrid.querySelectorAll('.icon-choice').forEach((b, idx) => {
      b.classList.toggle('active', idx === 0);
    });
    DOM.colorPickerGrid.querySelectorAll('.color-choice').forEach((b, idx) => {
      b.classList.toggle('active', idx === 0);
    });
    openModal(DOM.addBoxModal);
    setTimeout(() => DOM.inputBoxTitle.focus(), 150);
  }

  /* ==========================================================================
     Web Search Execution
     ========================================================================== */

  function executeWebSearch(query) {
    const q = encodeURIComponent(query.trim());
    let searchUrl = `https://www.google.com/search?q=${q}`;
    if (state.settings.searchEngine === 'brave') {
      searchUrl = `https://search.brave.com/search?q=${q}`;
    } else if (state.settings.searchEngine === 'duckduckgo') {
      searchUrl = `https://duckduckgo.com/?q=${q}`;
    } else if (state.settings.searchEngine === 'bing') {
      searchUrl = `https://www.bing.com/search?q=${q}`;
    }
    window.location.href = searchUrl;
  }

  /* ==========================================================================
     Gallery Modal Logic & Wallhaven 4K Integration
     ========================================================================== */

  function fetchWallhavenAPI(url, timeoutMs = 3500) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          // Try direct fetch before giving up
          fetch(url, { headers: { 'Accept': 'application/json' } })
            .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(resolve)
            .catch(() => reject(new Error('Fetch timeout')));
        }
      }, timeoutMs);

      const done = (fn, val) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          fn(val);
        }
      };

      // In Manifest V3, fetch from background service worker bypasses page CORS restrictions
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        try {
          chrome.runtime.sendMessage({ type: 'FETCH_WALLHAVEN', url }, (res) => {
            if (settled) return;
            if (chrome.runtime.lastError) {
              fetch(url)
                .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
                .then((d) => done(resolve, d))
                .catch((e) => done(reject, e));
              return;
            }
            if (res && res.success && res.data) {
              done(resolve, res.data);
            } else {
              fetch(url)
                .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
                .then((d) => done(resolve, d))
                .catch((e) => done(reject, new Error(res ? res.error : 'Network error')));
            }
          });
        } catch (err) {
          fetch(url)
            .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then((d) => done(resolve, d))
            .catch((e) => done(reject, e));
        }
      } else {
        fetch(url)
          .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
          .then((d) => done(resolve, d))
          .catch((e) => done(reject, e));
      }
    });
  }

  function getCuratedWallpapers(query = 'toplist') {
    if (typeof WALLPAPER_CATALOG === 'undefined' || !WALLPAPER_CATALOG.onlineCurated) {
      return [];
    }
    const curated = WALLPAPER_CATALOG.onlineCurated;
    const q = query.trim().toLowerCase();
    let rawList = curated[q] || [];

    if (rawList.length === 0) {
      for (const key of Object.keys(curated)) {
        if (q.includes(key) || key.includes(q)) {
          rawList = curated[key];
          break;
        }
      }
    }
    if (rawList.length === 0) rawList = curated['toplist'] || [];

    const qualityMode = state.settings.galleryQualityFilter || (state.settings.superHdOnly ? 'super-hd' : 'all');
    if (qualityMode !== 'all') {
      const filtered = rawList.filter((item) => isSuperHdWallpaper(item, qualityMode));
      if (filtered.length > 0) return filtered;
    }
    return rawList;
  }

  function renderWallhavenCards(items, append = false) {
    if (!append) DOM.galleryGrid.innerHTML = '';
    items.forEach((whItem) => {
      const card = document.createElement('div');
      card.className = 'gallery-item';
      if (state.currentBg && state.currentBg.src === whItem.path) {
        card.classList.add('active');
      }

      const thumb = whItem.thumbs && (whItem.thumbs.large || whItem.thumbs.original || whItem.thumbs.small)
        ? (whItem.thumbs.large || whItem.thumbs.original || whItem.thumbs.small)
        : whItem.path;

      card.innerHTML = `
        <img src="${thumb}" alt="${whItem.title || 'Wallpaper'}" loading="lazy">
        <span class="gallery-item-badge">${whItem.resolution || '4K'}</span>
        <div class="gallery-item-meta">
          <span class="gallery-item-title">${whItem.title || (whItem.category ? whItem.category.toUpperCase() : 'WALLHAVEN')}</span>
          <span class="gallery-item-res">${whItem.dimension_x || 3840}×${whItem.dimension_y || 2160}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        applyBackground({
          id: 'wh-' + whItem.id,
          title: whItem.title || `Wallpaper #${whItem.id}`,
          src: whItem.path,
          thumb: thumb
        }, false);
        closeModal(DOM.galleryModal);
      });

      DOM.galleryGrid.appendChild(card);
    });
  }

  async function fetchWallhaven(query = 'toplist', page = 1, append = false) {
    if (state.wallhavenLoading) return;
    state.wallhavenLoading = true;
    state.wallhavenQuery = query;
    state.wallhavenPage = page;

    const curatedList = getCuratedWallpapers(query);

    // Instant visual feedback on button when appending
    if (append && DOM.btnWallhavenLoadMore) {
      DOM.btnWallhavenLoadMore.innerHTML = `
        <div class="spinner-icon" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></div>
        <span>Loading Super HD Wallpapers...</span>
      `;
    }

    // Instant zero-latency rendering of curated 4K wallpapers for first page
    if (!append && curatedList.length > 0) {
      renderWallhavenCards(curatedList, false);
      if (DOM.wallhavenLoadMoreWrap) DOM.wallhavenLoadMoreWrap.classList.remove('hidden');
    } else if (!append) {
      DOM.galleryGrid.innerHTML = `
        <div class="wallhaven-spinner">
          <div class="spinner-icon"></div>
          <span>Loading Super HD Wallpapers...</span>
        </div>
      `;
      if (DOM.wallhavenLoadMoreWrap) DOM.wallhavenLoadMoreWrap.classList.add('hidden');
    }

    const qualityMode = state.settings.galleryQualityFilter || (state.settings.superHdOnly ? 'super-hd' : 'all');
    let resParam = '&atleast=2560x1440&ratios=16x9,16x10';
    if (qualityMode === '4k-only') {
      resParam = '&atleast=3840x2160&ratios=16x9,16x10';
    } else if (qualityMode === 'all') {
      resParam = '&resolutions=1920x1080,2560x1440,3840x2160';
    }

    try {
      let url = `https://wallhaven.cc/api/v1/search?sorting=toplist&purity=100${resParam}&page=${page}`;
      if (query && query !== 'toplist') {
        url = `https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(query)}&sorting=relevance&purity=100${resParam}&page=${page}`;
      }

      const json = await fetchWallhavenAPI(url);
      let liveItems = json.data || [];
      if (qualityMode !== 'all') {
        liveItems = liveItems.filter((item) => isSuperHdWallpaper(item, qualityMode));
      }

      if (liveItems.length > 0) {
        if (!append) {
          state.wallhavenItems = liveItems;
          renderWallhavenCards(liveItems, false);
        } else {
          state.wallhavenItems = state.wallhavenItems.concat(liveItems);
          renderWallhavenCards(liveItems, true);
        }

        if (DOM.wallhavenLoadMoreWrap) {
          const hasMore = json.meta && json.meta.current_page < json.meta.last_page;
          DOM.wallhavenLoadMoreWrap.classList.toggle('hidden', !hasMore);
        }
      } else if (append) {
        // Fallback append from curated wallpapers filtered by quality
        const perPage = 20;
        const offset = (page - 1) * perPage;
        let pool = state.wallpapers.filter((w) => !w.isVideo);
        if (qualityMode !== 'all') {
          pool = pool.filter((w) => isSuperHdWallpaper(w, qualityMode));
        }
        const startIndex = offset % pool.length;
        const nextSlice = pool.slice(startIndex, startIndex + perPage);
        if (nextSlice.length > 0) {
          const formatted = nextSlice.map((w) => ({
            id: w.id,
            title: w.title,
            category: w.category,
            path: w.src,
            thumbs: { large: w.thumb, small: w.thumb },
            resolution: w.resolution || '4K',
            dimension_x: 3840,
            dimension_y: 2160
          }));
          renderWallhavenCards(formatted, true);
        }
      } else if (!append && curatedList.length === 0) {
        DOM.galleryGrid.innerHTML = `
          <div class="wallhaven-spinner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 36px; height: 36px; opacity: 0.5;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>No Super HD wallpapers found for &ldquo;${query}&rdquo;</span>
          </div>
        `;
      }
    } catch (err) {
      console.warn('Wallhaven live sync error (falling back to curated Super HD feed):', err);
      if (append) {
        const perPage = 20;
        const offset = (page - 1) * perPage;
        let pool = state.wallpapers.filter((w) => !w.isVideo);
        if (qualityMode !== 'all') {
          pool = pool.filter((w) => isSuperHdWallpaper(w, qualityMode));
        }
        const startIndex = offset % pool.length;
        const nextSlice = pool.slice(startIndex, startIndex + perPage);
        if (nextSlice.length > 0) {
          const formatted = nextSlice.map((w) => ({
            id: w.id,
            title: w.title,
            category: w.category,
            path: w.src,
            thumbs: { large: w.thumb, small: w.thumb },
            resolution: w.resolution || '4K',
            dimension_x: 3840,
            dimension_y: 2160
          }));
          renderWallhavenCards(formatted, true);
        }
      } else if (curatedList.length === 0) {
        DOM.galleryGrid.innerHTML = `
          <div class="wallhaven-spinner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 36px; height: 36px; color: #f87171;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>Could not connect to Wallhaven live servers (${err.message || 'Network error'}).</span>
            <button id="btn-wh-retry" class="action-btn primary small-btn" style="margin-top: 0.5rem;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              <span>Retry Connection</span>
            </button>
          </div>
        `;
        const retryBtn = document.getElementById('btn-wh-retry');
        if (retryBtn) {
          retryBtn.addEventListener('click', () => {
            fetchWallhaven(query, page, false);
          });
        }
      }
    } finally {
      state.wallhavenLoading = false;
      if (DOM.btnWallhavenLoadMore) {
        DOM.btnWallhavenLoadMore.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          <span>Load More Wallpapers</span>
        `;
      }
    }
  }

  function renderGallery(activeTab = 'wallpapers', category = 'all') {
    DOM.galleryGrid.innerHTML = '';
    state.activeGalleryTab = activeTab;


    if (activeTab === 'wallhaven') {
      if (DOM.curatedWallpapersToolbar) DOM.curatedWallpapersToolbar.classList.add('hidden');
      if (DOM.wallhavenToolbar) DOM.wallhavenToolbar.classList.remove('hidden');
      if (state.wallhavenItems.length === 0) {
        fetchWallhaven(state.wallhavenQuery || 'toplist', 1, false);
      } else {
        renderWallhavenCards(state.wallhavenItems, false);
        if (DOM.wallhavenLoadMoreWrap) DOM.wallhavenLoadMoreWrap.classList.remove('hidden');
      }
      return;
    }

    if (DOM.wallhavenToolbar) DOM.wallhavenToolbar.classList.add('hidden');
    if (DOM.wallhavenLoadMoreWrap) DOM.wallhavenLoadMoreWrap.classList.add('hidden');

    if (activeTab === 'wallpapers') {
      if (DOM.curatedWallpapersToolbar) DOM.curatedWallpapersToolbar.classList.remove('hidden');
      state.curatedCategory = category;

      let items = state.wallpapers;
      const qualityMode = state.settings.galleryQualityFilter || (state.settings.superHdOnly ? 'super-hd' : 'all');
      if (qualityMode !== 'all') {
        items = items.filter((w) => isSuperHdWallpaper(w, qualityMode));
      }

      if (category && category !== 'all') {
        const catQuery = category.toLowerCase();
        items = items.filter((item) => {
          const itemCat = (item.category || '').toLowerCase();
          const itemTitle = (item.title || '').toLowerCase();
          return itemCat.includes(catQuery) || itemTitle.includes(catQuery);
        });
      }

      items.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'gallery-item';
        if (state.currentBg && (state.currentBg.id === item.id || state.currentBg.src === item.src)) {
          card.classList.add('active');
        }

        const previewThumb = item.thumb || item.src;

        card.innerHTML = `
          <img src="${previewThumb}" alt="${item.title}" loading="lazy">
          <span class="gallery-item-badge">${item.resolution || '4K'}</span>
          <div class="gallery-item-meta">
            <span class="gallery-item-title">${item.title}</span>
            <span class="gallery-item-res">${item.category || '4K'}</span>
          </div>
        `;

        card.addEventListener('click', () => {
          applyBackground(item, false);
          closeModal(DOM.galleryModal);
        });

        DOM.galleryGrid.appendChild(card);
      });
      return;
    }

    // Videos Tab
    if (DOM.curatedWallpapersToolbar) DOM.curatedWallpapersToolbar.classList.add('hidden');
    state.videos.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'gallery-item';
      if (state.currentBg && state.currentBg.id === item.id) {
        card.classList.add('active');
      }

      const previewThumb = item.poster || 'assets/wallpapers/thumbs/4k-alpine-sunset.jpg';

      card.innerHTML = `
        <img src="${previewThumb}" alt="${item.title}" loading="lazy">
        <span class="gallery-item-badge">${item.duration || 'Live'}</span>
        <div class="gallery-item-meta">
          <span class="gallery-item-title">${item.title}</span>
          <span class="gallery-item-res">${item.category || 'Live Motion'}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        applyBackground(item, true);
        closeModal(DOM.galleryModal);
      });

      DOM.galleryGrid.appendChild(card);
    });
  }

  function openGallery() {
    const isVid = state.currentBg && state.currentBg.type === 'video';
    const targetTab = isVid ? 'videos' : 'wallpapers';

    DOM.galleryTabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.tab === targetTab);
    });


    renderGallery(targetTab, 'all');
    openModal(DOM.galleryModal);
  }

  /* ==========================================================================
     Incognito Window & Tab Engine
     ========================================================================== */

  function openIncognito() {
    if (typeof chrome !== 'undefined' && chrome.windows && chrome.windows.create) {
      chrome.windows.getAll({ populate: true, windowTypes: ['normal'] }, (windows) => {
        if (chrome.runtime.lastError) {
          console.warn('Tabwai: Window query error:', chrome.runtime.lastError.message);
        }

        const existingIncognito = (windows || []).find((w) => w.incognito);

        if (existingIncognito) {
          // An incognito window is already open: open a new tab in it and focus the window
          if (chrome.tabs && chrome.tabs.create) {
            chrome.tabs.create({ windowId: existingIncognito.id }, () => {
              chrome.windows.update(existingIncognito.id, { focused: true });
            });
          } else {
            chrome.windows.update(existingIncognito.id, { focused: true });
          }
        } else {
          // No incognito window open: create a new incognito window (opens with a fresh new tab)
          chrome.windows.create({ incognito: true, focused: true }, (newWin) => {
            if (chrome.runtime.lastError) {
              console.warn('Tabwai: Could not open incognito window:', chrome.runtime.lastError.message);
              window.open('https://www.google.com', '_blank');
            }
          });
        }
      });
    } else {
      window.open('https://www.google.com', '_blank');
    }
  }

  /* ==========================================================================
     Ambient Soundscapes Engine (Studio High-Fidelity Audio Tracks)
     Gentle Rain, Ocean Waves, Cozy Campfire, Forest Birds, Deep Focus Noise
     ========================================================================== */

  const SoundscapeEngine = (() => {
    const SOUND_TRACKS = {
      fire: 'assets/sounds/fire.mp3',
      birds: 'assets/sounds/birds.mp3',
      rain: 'assets/sounds/rain.mp3',
      ocean: 'assets/sounds/ocean.mp3',
      river: 'assets/sounds/river.mp3',
      crickets: 'assets/sounds/crickets.mp3',
      thunder: 'assets/sounds/thunder.mp3'
    };

    const audioInstances = {};
    let currentPreset = 'fire';
    let currentAudio = null;
    let isPlaying = false;
    let volume = 0.65;
    let fadeInterval = null;
    let timerRemainingSeconds = 0;
    let timerCountdownInterval = null;

    function resolveSoundUrl(relPath) {
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function') {
          const url = chrome.runtime.getURL(relPath);
          if (url) return url;
        }
      } catch (e) { }
      return relPath;
    }

    function createAudioInstance(preset) {
      const relPath = SOUND_TRACKS[preset] || SOUND_TRACKS.fire;
      const fullUrl = resolveSoundUrl(relPath);
      const audio = new Audio();
      audio.loop = true;
      audio.preload = 'auto';
      audio.src = fullUrl;

      audio.addEventListener('error', () => {
        console.warn(`Soundscape audio error on ${fullUrl}, falling back to ${relPath}`);
        if (audio.src !== relPath) {
          audio.src = relPath;
          if (isPlaying && currentPreset === preset) {
            audio.play().catch((err) => console.warn('Fallback play error:', err));
          }
        }
      });

      return audio;
    }

    function getAudio(preset) {
      if (!audioInstances[preset]) {
        audioInstances[preset] = createAudioInstance(preset);
      }
      return audioInstances[preset];
    }

    function clearFader() {
      if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
      }
    }

    function playTrack(presetName, targetVol = volume, crossfadeDuration = 350) {
      clearFader();
      const nextAudio = getAudio(presetName);
      const prevAudio = (currentAudio && currentAudio !== nextAudio) ? currentAudio : null;

      currentPreset = presetName;
      currentAudio = nextAudio;
      isPlaying = true;
      updateUI();

      nextAudio.volume = prevAudio ? 0 : targetVol;
      const playPromise = nextAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Soundscape play interrupted or blocked:', err);
        });
      }

      if (prevAudio) {
        const steps = 14;
        const stepTime = Math.max(16, Math.floor(crossfadeDuration / steps));
        let step = 0;
        const prevStartVol = prevAudio.volume;

        fadeInterval = setInterval(() => {
          step++;
          const progress = Math.min(1, step / steps);
          const ease = 0.5 - 0.5 * Math.cos(progress * Math.PI);

          nextAudio.volume = Math.max(0, Math.min(1, targetVol * ease));
          prevAudio.volume = Math.max(0, Math.min(1, prevStartVol * (1 - ease)));

          if (step >= steps) {
            clearFader();
            prevAudio.pause();
            prevAudio.currentTime = 0;
            nextAudio.volume = targetVol;
          }
        }, stepTime);
      } else {
        nextAudio.volume = targetVol;
      }
    }

    function stopTrack(fadeDuration = 250, onDone = null) {
      clearFader();
      isPlaying = false;
      updateUI();

      if (!currentAudio) {
        if (onDone) onDone();
        return;
      }

      const audioToStop = currentAudio;
      const startVol = audioToStop.volume;
      const steps = 10;
      const stepTime = Math.max(16, Math.floor(fadeDuration / steps));
      let step = 0;

      fadeInterval = setInterval(() => {
        step++;
        const progress = Math.min(1, step / steps);
        audioToStop.volume = Math.max(0, startVol * (1 - progress));

        if (step >= steps) {
          clearFader();
          audioToStop.pause();
          audioToStop.currentTime = 0;
          audioToStop.volume = volume;
          if (onDone) onDone();
        }
      }, stepTime);
    }

    function startSound(presetName = currentPreset) {
      playTrack(presetName, volume, 350);
    }

    function stopSound() {
      stopTrack(250);
    }

    function togglePlay() {
      if (isPlaying) {
        stopSound();
      } else {
        startSound(currentPreset);
      }
    }

    function setVolume(val) {
      volume = Math.max(0, Math.min(1, val));
      if (currentAudio && isPlaying && !fadeInterval) {
        currentAudio.volume = volume;
      }
    }

    function setTimerMinutes(mins) {
      if (timerCountdownInterval) {
        clearInterval(timerCountdownInterval);
        timerCountdownInterval = null;
      }

      if (mins <= 0) {
        timerRemainingSeconds = 0;
        updateTimerBadge();
        return;
      }

      timerRemainingSeconds = mins * 60;
      updateTimerBadge();

      if (!isPlaying) {
        startSound(currentPreset);
      }

      timerCountdownInterval = setInterval(() => {
        timerRemainingSeconds--;
        if (timerRemainingSeconds <= 0) {
          clearInterval(timerCountdownInterval);
          timerCountdownInterval = null;
          stopTrack(3200, () => {
            if (currentAudio) currentAudio.volume = volume;
          });
        }
        updateTimerBadge();
      }, 1000);
    }

    function updateTimerBadge() {
      if (!DOM.soundscapeTimerCountdown || !DOM.soundscapeTimerLabel) return;
      if (timerRemainingSeconds > 0) {
        const m = Math.floor(timerRemainingSeconds / 60);
        const s = timerRemainingSeconds % 60;
        DOM.soundscapeTimerLabel.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        DOM.soundscapeTimerCountdown.classList.remove('hidden');
        DOM.soundscapeTimerCountdown.style.display = 'inline-flex';
      } else {
        DOM.soundscapeTimerCountdown.classList.add('hidden');
        DOM.soundscapeTimerCountdown.style.display = 'none';
      }
    }

    function updateUI() {
      if (DOM.soundscapeActiveBadge) {
        DOM.soundscapeActiveBadge.classList.toggle('hidden', !isPlaying);
        DOM.soundscapeActiveBadge.style.display = isPlaying ? 'flex' : 'none';
      }
      if (DOM.btnSoundscapeToggle) {
        DOM.btnSoundscapeToggle.classList.toggle('playing', isPlaying);
        const playIcon = DOM.btnSoundscapeToggle.querySelector('.icon-play');
        const pauseIcon = DOM.btnSoundscapeToggle.querySelector('.icon-pause');
        if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'inline-block';
        if (pauseIcon) pauseIcon.style.display = isPlaying ? 'inline-block' : 'none';
      }
      if (DOM.soundscapeStatusText) {
        DOM.soundscapeStatusText.textContent = isPlaying ? 'Pause Soundscape' : 'Start Soundscape';
      }
      const allCards = document.querySelectorAll('#soundscape-presets .soundscape-card');
      allCards.forEach((card) => {
        card.classList.toggle('active', card.dataset.sound === currentPreset);
      });
    }

    return {
      startSound,
      stopSound,
      togglePlay,
      setVolume,
      setTimerMinutes,
      getCurrentPreset: () => currentPreset,
      getIsPlaying: () => isPlaying,
      updateUI
    };
  })();

  /* ==========================================================================
     Modals Management
     ========================================================================== */

  function openModal(modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  /* ==========================================================================
     Tactile UI Sound Engine (Web Audio API - Crisp Glassy Pops & Chimes)
     Zero-latency synthesized acoustic feedback on UI hovers and interactions
     ========================================================================== */
  const SoundFX = (() => {
    let audioCtx = null;
    let lastSoundTime = 0;

    function getAudioContext() {
      try {
        if (!audioCtx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            audioCtx = new AudioContextClass();
          }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
        return audioCtx;
      } catch (e) {
        return null;
      }
    }

    // Warm up audio context on first user movement so hover sounds play instantly
    function warmup() {
      getAudioContext();
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', warmup, { once: true, passive: true });
      window.addEventListener('mousemove', warmup, { once: true, passive: true });
    }

    // Play an ultra-clean, glassy acoustic bubble pop / macOS tactile click
    function playHover(pitch = 1.0) {
      try {
        const now = performance.now();
        if (now - lastSoundTime < 32) return; // Debounce rapid sweeps
        lastSoundTime = now;

        const ctx = getAudioContext();
        if (!ctx) return;

        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm, tactile frequency with subtle pitch envelope drop
        const baseFreq = 560 * Math.max(0.6, Math.min(2.4, pitch));
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.74, t + 0.045);

        // Tactile micro-envelope: instantaneous attack, soft decay (42ms)
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.042);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.048);
      } catch (e) {}
    }

    // Subtle glassy chime when dock slides open
    function playDockOpen() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(360, t);
        osc.frequency.exponentialRampToValueAtTime(520, t + 0.07);

        gain.gain.setValueAtTime(0.025, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.085);
      } catch (e) {}
    }

    return {
      playHover,
      playDockOpen,
      warmup
    };
  })();

  /* ==========================================================================
     macOS Left Glass AI Launchpad Dock Engine
     Authentic Apple vertical slide-in shelf with fisheye magnification wave,
     running status dots, brand squircle icons, customizable apps & pin toggle
     ========================================================================== */

  const MacAiDockEngine = (() => {
    let closeTimeout = null;
    function getAppIconSvg(iconType, title, url) {
      switch (iconType) {
        case 'chatgpt':
          return `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
          </svg>`;
        case 'claude':
          return `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/>
          </svg>`;
        case 'perplexity':
          return `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.3977 7.0896h-2.3106V.0676l-7.5094 6.3542V.1577h-1.1554v6.1966L4.4904 0v7.0896H1.6023v10.3976h2.8882V24l6.932-6.3591v6.2005h1.1554v-6.0469l6.9318 6.1807v-6.4879h2.8882V7.0896zm-3.4657-4.531v4.531h-5.355l5.355-4.531zm-13.2862.0676 4.8691 4.4634H5.6458V2.6262zM2.7576 16.332V8.245h7.8476l-6.1149 6.1147v1.9723H2.7576zm2.8882 5.0404v-3.8852h.0001v-2.6488l5.7763-5.7764v7.0111l-5.7764 5.2993zm12.7086.0248-5.7766-5.1509V9.0618l5.7766 5.7766v6.5588zm2.8882-5.0652h-1.733v-1.9723L13.3948 8.245h7.8478v8.087z"/>
          </svg>`;
        case 'gemini':
          return `<svg viewBox="0 0 24 24">
            <defs>
              <linearGradient id="geminiGradDock" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#4E95FF"/>
                <stop offset="50%" stop-color="#9357FF"/>
                <stop offset="100%" stop-color="#FF5C77"/>
              </linearGradient>
            </defs>
            <path fill="url(#geminiGradDock)" d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81"/>
          </svg>`;
        case 'ai':
          return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.2 2.2m8.4 8.4l2.2 2.2M5.6 18.4l2.2-2.2m8.4-8.4l2.2-2.2"/>
            <circle cx="12" cy="12" r="4" fill="rgba(255,255,255,0.25)"/>
          </svg>`;
        case 'code':
          return `<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 17 10 11 4 5"/>
            <line x1="12" y1="19" x2="20" y2="19"/>
          </svg>`;
        case 'auto':
        default: {
          const fav = getFaviconUrl(url);
          const initial = (title && title.charAt(0)) ? title.charAt(0).toUpperCase() : 'AI';
          return `<img src="${fav}" class="dock-favicon" alt="${title}" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='inline-block';"><span class="dock-fallback-letter" style="display:none; font-weight:700; font-size:15px; color:#ffffff;">${initial}</span>`;
        }
      }
    }

    function render() {
      if (!DOM.dockItemsContainer) return;
      DOM.dockItemsContainer.innerHTML = '';

      if (!state.dockApps || state.dockApps.length === 0) {
        state.dockApps = JSON.parse(JSON.stringify(DEFAULT_DOCK_APPS));
      }

      state.dockApps.forEach((app, index) => {
        const wrap = document.createElement('div');
        wrap.className = 'dock-item-wrap';
        wrap.dataset.id = app.id;

        const iconTypeClass = app.iconType ? `icon-${app.iconType}` : 'icon-auto';
        const targetAttr = state.settings.openInNewTab ? '_blank' : '_self';

        wrap.innerHTML = `
          <button class="dock-delete-badge" data-id="${app.id}" title="Remove ${app.title}" aria-label="Remove ${app.title}">×</button>
          <a href="${app.url}" class="dock-app-icon ${iconTypeClass}" target="${targetAttr}" rel="noopener noreferrer" title="${app.title}" data-id="${app.id}">
            ${getAppIconSvg(app.iconType, app.title, app.url)}
          </a>
          <span class="dock-dot-indicator" title="Active"></span>
          <span class="dock-tooltip">${app.title}</span>
        `;

        // Tactile sound feedback on icon hover with harmonized musical scale
        wrap.addEventListener('mouseenter', () => {
          const notes = [1.0, 1.12, 1.25, 1.36, 1.5, 1.68, 1.82];
          const pitch = notes[index % notes.length] || 1.1;
          SoundFX.playHover(pitch);
        });

        // Handle clicks
        const link = wrap.querySelector('.dock-app-icon');
        const deleteBadge = wrap.querySelector('.dock-delete-badge');

        if (link) {
          link.addEventListener('click', (e) => {
            if (state.dockEditing) {
              e.preventDefault();
              e.stopPropagation();
              openEditModal(app.id);
            }
          });
        }

        if (deleteBadge) {
          deleteBadge.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            removeApp(app.id);
          });
        }

        DOM.dockItemsContainer.appendChild(wrap);
      });
    }

    function openDock() {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      if (!DOM.macDockWrapper) return;
      if (!DOM.macDockWrapper.classList.contains('is-open')) {
        DOM.macDockWrapper.classList.add('is-open');
        SoundFX.playDockOpen();
      }
    }

    function scheduleCloseDock(delayMs = 280) {
      if (state.dockPinned || state.dockEditing) return;
      if (DOM.modalDockApp && DOM.modalDockApp.classList.contains('open')) return;
      if (closeTimeout) clearTimeout(closeTimeout);
      closeTimeout = setTimeout(() => {
        closeDock();
      }, delayMs);
    }

    function closeDock() {
      if (state.dockPinned || state.dockEditing) return;
      if (DOM.modalDockApp && DOM.modalDockApp.classList.contains('open')) return;
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
      if (DOM.macDockWrapper && DOM.macDockWrapper.classList.contains('is-open')) {
        DOM.macDockWrapper.classList.remove('is-open');
      }
    }

    function toggleDock() {
      if (!DOM.macDockWrapper) return;
      const isOpen = DOM.macDockWrapper.classList.contains('is-open');
      if (isOpen) {
        if (!state.dockPinned && !state.dockEditing) {
          closeDock();
        }
      } else {
        openDock();
      }
    }

    function syncPin() {
      if (DOM.macDockShelf) {
        DOM.macDockShelf.classList.toggle('is-pinned', !!state.dockPinned);
      }
      if (DOM.btnDockPin) {
        DOM.btnDockPin.classList.toggle('active', !!state.dockPinned);
      }
      if (state.dockPinned) {
        openDock();
      }
    }

    function togglePin() {
      state.dockPinned = !state.dockPinned;
      syncPin();
      storageSet({ dockPinned: state.dockPinned });
    }

    function toggleEditMode() {
      state.dockEditing = !state.dockEditing;
      if (DOM.macDockShelf) {
        DOM.macDockShelf.classList.toggle('is-editing', state.dockEditing);
      }
      if (DOM.btnDockEdit) {
        DOM.btnDockEdit.classList.toggle('active', state.dockEditing);
      }
      if (state.dockEditing) {
        openDock();
      }
    }

    function exitEditMode() {
      if (!state.dockEditing) return;
      state.dockEditing = false;
      if (DOM.macDockShelf) {
        DOM.macDockShelf.classList.remove('is-editing');
      }
      if (DOM.btnDockEdit) {
        DOM.btnDockEdit.classList.remove('active');
      }
    }

    function removeApp(appId) {
      state.dockApps = state.dockApps.filter((a) => a.id !== appId);
      storageSet({ dockApps: state.dockApps });
      render();
    }

    function openAddModal() {
      if (!DOM.modalDockApp) return;
      if (DOM.dockModalTitle) DOM.dockModalTitle.textContent = 'Add App to AI Dock';
      if (DOM.dockAppId) DOM.dockAppId.value = '';
      if (DOM.dockAppTitle) DOM.dockAppTitle.value = '';
      if (DOM.dockAppUrl) DOM.dockAppUrl.value = '';
      if (DOM.dockAppIcon) DOM.dockAppIcon.value = 'auto';
      openModal(DOM.modalDockApp);
      setTimeout(() => {
        if (DOM.dockAppTitle) DOM.dockAppTitle.focus();
      }, 100);
    }

    function openEditModal(appId) {
      const app = state.dockApps.find((a) => a.id === appId);
      if (!app || !DOM.modalDockApp) return;
      if (DOM.dockModalTitle) DOM.dockModalTitle.textContent = `Edit App: ${app.title}`;
      if (DOM.dockAppId) DOM.dockAppId.value = app.id;
      if (DOM.dockAppTitle) DOM.dockAppTitle.value = app.title;
      if (DOM.dockAppUrl) DOM.dockAppUrl.value = app.url;
      if (DOM.dockAppIcon) DOM.dockAppIcon.value = app.iconType || 'auto';
      openModal(DOM.modalDockApp);
      setTimeout(() => {
        if (DOM.dockAppTitle) DOM.dockAppTitle.focus();
      }, 100);
    }

    function handleFormSubmit(e) {
      e.preventDefault();
      const id = DOM.dockAppId ? DOM.dockAppId.value.trim() : '';
      let title = DOM.dockAppTitle ? DOM.dockAppTitle.value.trim() : '';
      let url = DOM.dockAppUrl ? DOM.dockAppUrl.value.trim() : '';
      const iconType = DOM.dockAppIcon ? DOM.dockAppIcon.value : 'auto';

      if (!title || !url) return;

      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      if (id) {
        // Edit existing
        const idx = state.dockApps.findIndex((a) => a.id === id);
        if (idx !== -1) {
          state.dockApps[idx] = {
            ...state.dockApps[idx],
            title,
            url,
            iconType
          };
        }
      } else {
        // Add new
        const newApp = {
          id: 'dock_' + Date.now(),
          title,
          url,
          iconType
        };
        state.dockApps.push(newApp);
      }

      storageSet({ dockApps: state.dockApps });
      render();
      closeModal(DOM.modalDockApp);
    }

    // Authentic macOS Dock Magnification Wave Math
    function handleFisheye(e) {
      if (!DOM.dockItemsContainer) return;
      const items = DOM.dockItemsContainer.querySelectorAll('.dock-item-wrap');
      if (!items.length) return;

      const mouseY = e.clientY;
      const maxDistance = 110; // influence radius in px
      const maxScaleBoost = 0.44; // Up to ~1.44x magnification

      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const itemCenterY = rect.top + rect.height / 2;
        const dist = Math.abs(mouseY - itemCenterY);

        if (dist < maxDistance) {
          const norm = dist / maxDistance; // 0 to 1
          const factor = (Math.cos(norm * Math.PI) + 1) / 2; // Cosine smooth curve 1 down to 0
          const scaleBoost = factor * maxScaleBoost;
          const scale = 1 + scaleBoost;
          const shiftX = factor * 14; // expand outward into the viewport
          item.style.transform = `scale(${scale.toFixed(3)}) translateX(${shiftX.toFixed(1)}px)`;
          item.style.zIndex = Math.round(scale * 10);
        } else {
          item.style.transform = 'scale(1) translateX(0px)';
          item.style.zIndex = '1';
        }
      });
    }

    function resetFisheye() {
      if (!DOM.dockItemsContainer) return;
      const items = DOM.dockItemsContainer.querySelectorAll('.dock-item-wrap');
      items.forEach((item) => {
        item.style.transform = '';
        item.style.zIndex = '';
      });
    }

    function init() {
      render();
      syncPin();

      // Trigger & Edge Detection with smooth grace buffer
      if (DOM.macDockHandle) {
        DOM.macDockHandle.addEventListener('mouseenter', () => {
          SoundFX.playHover(0.95);
          openDock();
        });
        DOM.macDockHandle.addEventListener('mouseleave', () => {
          scheduleCloseDock(280);
        });
        DOM.macDockHandle.addEventListener('click', toggleDock);
      }

      if (DOM.macDockShelf) {
        DOM.macDockShelf.addEventListener('mouseenter', () => {
          openDock();
        });
        DOM.macDockShelf.addEventListener('mouseleave', () => {
          scheduleCloseDock(280);
        });
      }

      document.addEventListener('mousemove', (e) => {
        if (state.dockPinned || state.dockEditing) return;
        if (DOM.modalDockApp && DOM.modalDockApp.classList.contains('open')) return;

        // Smooth slide open when cursor touches left edge (within 24px)
        if (e.clientX <= 24) {
          openDock();
        } else if (e.clientX > 150) {
          // When cursor safely moves away past the dock shelf + magnified icons
          if (DOM.macDockShelf && !DOM.macDockShelf.contains(e.target) && DOM.macDockHandle && !DOM.macDockHandle.contains(e.target)) {
            scheduleCloseDock(220);
          }
        }
      });

      document.addEventListener('mouseleave', () => {
        scheduleCloseDock(100);
      });

      // Magnification on hover wave
      if (DOM.dockItemsContainer) {
        DOM.dockItemsContainer.addEventListener('mousemove', handleFisheye);
        DOM.dockItemsContainer.addEventListener('mouseleave', resetFisheye);
      }

      // Pin button
      if (DOM.btnDockPin) {
        DOM.btnDockPin.addEventListener('mouseenter', () => {
          SoundFX.playHover(1.3);
        });
        DOM.btnDockPin.addEventListener('click', (e) => {
          e.stopPropagation();
          togglePin();
          SoundFX.playHover(1.6);
        });
      }

      // Add & Edit Tool buttons
      if (DOM.btnDockAdd) {
        DOM.btnDockAdd.addEventListener('mouseenter', () => {
          SoundFX.playHover(1.4);
        });
        DOM.btnDockAdd.addEventListener('click', (e) => {
          e.stopPropagation();
          openAddModal();
        });
      }

      if (DOM.btnDockEdit) {
        DOM.btnDockEdit.addEventListener('mouseenter', () => {
          SoundFX.playHover(1.22);
        });
        DOM.btnDockEdit.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleEditMode();
        });
      }

      // Modal buttons & form
      if (DOM.dockModalClose) {
        DOM.dockModalClose.addEventListener('click', () => closeModal(DOM.modalDockApp));
      }
      if (DOM.btnCancelDockApp) {
        DOM.btnCancelDockApp.addEventListener('click', () => closeModal(DOM.modalDockApp));
      }
      if (DOM.modalDockApp) {
        DOM.modalDockApp.addEventListener('click', (e) => {
          if (e.target === DOM.modalDockApp) closeModal(DOM.modalDockApp);
        });
      }
      if (DOM.dockAppForm) {
        DOM.dockAppForm.addEventListener('submit', handleFormSubmit);
      }

      // Exit edit mode when clicking elsewhere outside dock
      document.addEventListener('click', (e) => {
        if (state.dockEditing && DOM.macDockShelf && !DOM.macDockShelf.contains(e.target)) {
          exitEditMode();
        }
      });
    }

    return {
      init,
      render,
      syncPin,
      openDock,
      closeDock,
      toggleEditMode,
      exitEditMode
    };
  })();

  /* ==========================================================================
     Settings & Preferences
     ========================================================================== */

  async function loadSettingsAndPreferences() {
    const data = await storageGet([
      'currentBg',
      'settings',
      'boxes',
      'customSites',
      'siteBoxMapping',
      'pinnedUrls',
      'hiddenUrls',
      'sortMode',
      'browserName',
      'localVisitCounts',
      'dockApps',
      'dockPinned'
    ]);

    if (data.currentBg) state.currentBg = data.currentBg;
    if (data.settings) state.settings = { ...state.settings, ...data.settings };
    // Immediately apply clock style appearance from settings without waiting for wallpaper analysis
    const activeStyleMode = state.settings.clockStyleMode || 'auto';
    applyClockStyle(activeStyleMode, lastDetectedIsLight);
    if (data.boxes && Array.isArray(data.boxes) && data.boxes.length > 0) {
      state.boxes = data.boxes;
    } else {
      state.boxes = JSON.parse(JSON.stringify(DEFAULT_BOXES));
    }
    if (data.dockApps && Array.isArray(data.dockApps) && data.dockApps.length > 0) {
      state.dockApps = data.dockApps;
    } else {
      state.dockApps = JSON.parse(JSON.stringify(DEFAULT_DOCK_APPS));
    }
    if (data.dockPinned !== undefined) {
      state.dockPinned = !!data.dockPinned;
    }
    if (data.customSites && Array.isArray(data.customSites) && data.customSites.length > 0) {
      state.customSites = data.customSites;
    } else {
      state.customSites = JSON.parse(JSON.stringify(DEFAULT_CUSTOM_SITES));
      storageSet({ customSites: state.customSites });
    }
    if (data.siteBoxMapping) state.siteBoxMapping = data.siteBoxMapping;
    if (data.pinnedUrls) state.pinnedUrls = new Set(data.pinnedUrls);
    if (data.hiddenUrls) state.hiddenUrls = new Set(data.hiddenUrls);
    if (data.browserName && data.browserName !== 'My Chrome') {
      state.browserName = data.browserName;
    } else {
      state.browserName = 'Tabwai';
      storageSet({ browserName: 'Tabwai' });
    }

    if (DOM.browserNameInput) {
      DOM.browserNameInput.value = state.browserName;
      updateBrowserNameWidth();
    }

    if (DOM.settingShowClock) DOM.settingShowClock.checked = state.settings.showClock !== false;
    if (DOM.settingShowSearch) DOM.settingShowSearch.checked = state.settings.showSearch !== false;
    if (DOM.setting24hClock) DOM.setting24hClock.checked = state.settings.use24h;
    if (DOM.settingShowDate) DOM.settingShowDate.checked = state.settings.showDate !== false;
    if (DOM.settingShowGreeting) DOM.settingShowGreeting.checked = state.settings.showGreeting !== false;
    if (DOM.settingClockStyle) {
      const validMode = (state.settings.clockStyleMode === 'capsule') ? 'capsule' : 'auto';
      DOM.settingClockStyle.value = validMode;
    }
    state.settings.lockWallpaper = (data.settings && data.settings.lockWallpaper !== undefined)
      ? !!data.settings.lockWallpaper
      : (localStorage.getItem('tabwai_wallpaper_locked') === 'true');
    updateWallpaperLockUI(state.settings.lockWallpaper);

    // Hardcode sensible defaults for removed settings
    state.settings.superHdOnly = true;
    state.settings.galleryQualityFilter = 'super-hd';
    state.settings.videoMuted = true;
    state.settings.vignette = false;


    if (DOM.dashboardSubtitle) {
      DOM.dashboardSubtitle.textContent = 'Custom workspace boxes & bookmarks';
    }
  }

  async function saveSettings() {
    if (DOM.settingShowClock) state.settings.showClock = DOM.settingShowClock.checked;
    if (DOM.settingShowSearch) state.settings.showSearch = DOM.settingShowSearch.checked;
    if (DOM.settingShowDate) state.settings.showDate = DOM.settingShowDate.checked;
    if (DOM.settingShowGreeting) state.settings.showGreeting = DOM.settingShowGreeting.checked;
    if (DOM.setting24hClock) state.settings.use24h = DOM.setting24hClock.checked;
    if (DOM.settingAdaptiveClock) state.settings.adaptiveClock = DOM.settingAdaptiveClock.checked;
    if (DOM.settingLockWallpaper) {
      state.settings.lockWallpaper = DOM.settingLockWallpaper.checked;
      try { localStorage.setItem('tabwai_wallpaper_locked', state.settings.lockWallpaper ? 'true' : 'false'); } catch (e) { }
      updateWallpaperLockUI(state.settings.lockWallpaper);
    }
    if (DOM.settingClockStyle) {
      state.settings.clockStyleMode = DOM.settingClockStyle.value;
      try {
        localStorage.setItem('tabwai_clock_style', state.settings.clockStyleMode);
        if (document.documentElement) {
          document.documentElement.setAttribute('data-clock-style', state.settings.clockStyleMode);
        }
      } catch (e) { }
    }

    await storageSet({ settings: state.settings });
    updateClock();
    applyClockStyle(state.settings.clockStyleMode, lastDetectedIsLight);

    // Re-evaluate adaptive clock styling whenever settings are modified
    const currentSrc = state.currentBg ? (state.currentBg.src || state.currentBg.poster || null) : null;
    const isVid = state.currentBg ? (state.currentBg.type === 'video') : false;
    updateAdaptiveClockStyle(currentSrc, isVid);

    await fetchAndRenderBoxes();
  }

  /* ==========================================================================
     First-Run Onboarding Banner Hint (7s Auto-dismiss, Left Corner)
     ========================================================================== */
  let bannerHintTimer = null;

  function dismissBannerHint() {
    if (!DOM.bannerHintPopup) return;
    if (bannerHintTimer) {
      clearTimeout(bannerHintTimer);
      bannerHintTimer = null;
    }
    DOM.bannerHintPopup.classList.remove('show');
    DOM.bannerHintPopup.classList.add('closing');
    setTimeout(() => {
      if (DOM.bannerHintPopup) {
        DOM.bannerHintPopup.classList.add('hidden');
        DOM.bannerHintPopup.classList.remove('closing');
      }
    }, 400);
  }

  async function checkAndShowBannerHint() {
    if (!DOM.bannerHintPopup) return;

    // Check if user has already seen this tip
    try {
      const localSeen = localStorage.getItem('tabwai_banner_tip_seen');
      if (localSeen === 'true') return;

      const stored = await storageGet(['bannerTipSeen']);
      if (stored && stored.bannerTipSeen) {
        localStorage.setItem('tabwai_banner_tip_seen', 'true');
        return;
      }
    } catch (e) {
      // Continue safely
    }

    // Mark as seen immediately so it doesn't trigger on multiple new tabs opened simultaneously
    try {
      localStorage.setItem('tabwai_banner_tip_seen', 'true');
      storageSet({ bannerTipSeen: true });
    } catch (e) { }

    // Wait 700ms after new tab load before sliding up
    setTimeout(() => {
      if (!DOM.bannerHintPopup) return;
      DOM.bannerHintPopup.classList.remove('hidden');
      // Force layout reflow so transitions execute cleanly
      void DOM.bannerHintPopup.offsetWidth;
      DOM.bannerHintPopup.classList.add('show');

      // Auto dismiss after 7 seconds (7000ms)
      bannerHintTimer = setTimeout(() => {
        dismissBannerHint();
      }, 7000);
    }, 700);
  }

  /* ==========================================================================
     Event Handlers & Interactivity
     ========================================================================== */

  function updateBrowserNameWidth() {
    if (!DOM.browserNameInput) return;
    const text = DOM.browserNameInput.value || DOM.browserNameInput.placeholder || 'Tabwai';
    DOM.browserNameInput.style.width = Math.min(240, Math.max(75, (text.length + 1) * 8.5)) + 'px';
  }

  function bindEvents() {
    // Editable Browser Profile Name
    if (DOM.browserNameInput && DOM.browserNameBox) {
      DOM.browserNameBox.addEventListener('click', () => {
        DOM.browserNameInput.focus();
      });

      DOM.browserNameInput.addEventListener('input', () => {
        updateBrowserNameWidth();
        state.browserName = DOM.browserNameInput.value.trim() || 'Tabwai';
        storageSet({ browserName: state.browserName });
      });

      DOM.browserNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          DOM.browserNameInput.blur();
        }
      });

      DOM.browserNameInput.addEventListener('blur', () => {
        if (!DOM.browserNameInput.value.trim()) {
          DOM.browserNameInput.value = 'Tabwai';
          state.browserName = 'Tabwai';
          storageSet({ browserName: state.browserName });
        }
        updateBrowserNameWidth();
      });
    }

    // Google Search Box Below Clock
    if (DOM.googleSearchForm && DOM.googleSearchInput) {
      DOM.googleSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const raw = DOM.googleSearchInput.value.trim();
        if (!raw) return;

        // Check if user entered a direct URL (e.g. github.com, youtube.com, or https://...)
        const isUrl = /^https?:\/\//i.test(raw) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(raw);
        if (isUrl) {
          const targetUrl = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
          if (state.settings.openInNewTab) {
            window.open(targetUrl, '_blank');
          } else {
            window.location.href = targetUrl;
          }
        } else {
          executeWebSearch(raw);
        }
      });

      DOM.googleSearchInput.addEventListener('input', () => {
        if (DOM.googleSearchClear) {
          DOM.googleSearchClear.classList.toggle('hidden', DOM.googleSearchInput.value.length === 0);
        }
      });

      if (DOM.googleSearchClear) {
        DOM.googleSearchClear.addEventListener('click', () => {
          DOM.googleSearchInput.value = '';
          DOM.googleSearchClear.classList.add('hidden');
          DOM.googleSearchInput.focus();
        });
      }
    }

    // Scroll cue click
    DOM.scrollCue.addEventListener('click', () => {
      DOM.dashboardSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Return to top
    DOM.btnScrollTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Add Box Button in Header
    DOM.btnAddBox.addEventListener('click', openAddBoxModal);
    DOM.addBoxCloseBtn.addEventListener('click', () => closeModal(DOM.addBoxModal));
    DOM.btnCancelAddBox.addEventListener('click', () => closeModal(DOM.addBoxModal));
    DOM.addBoxModal.addEventListener('click', (e) => {
      if (e.target === DOM.addBoxModal) closeModal(DOM.addBoxModal);
    });

    // Icon Picker choices
    DOM.iconPickerGrid.querySelectorAll('.icon-choice').forEach((btn) => {
      btn.addEventListener('click', () => {
        DOM.iconPickerGrid.querySelectorAll('.icon-choice').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        DOM.inputBoxIcon.value = btn.dataset.icon;
      });
    });

    // Color Picker choices
    DOM.colorPickerGrid.querySelectorAll('.color-choice').forEach((btn) => {
      btn.addEventListener('click', () => {
        DOM.colorPickerGrid.querySelectorAll('.color-choice').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        DOM.inputBoxColor.value = btn.dataset.color;
      });
    });

    // Add Box Form Submit
    DOM.addBoxForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = DOM.inputBoxTitle.value.trim();
      const icon = DOM.inputBoxIcon.value || '📌';
      const color = DOM.inputBoxColor.value || 'cyan';

      if (title) {
        const id = 'box-' + Date.now();
        const newBox = { id, title, icon, color, isDefault: false };
        state.boxes.push(newBox);
        storageSet({ boxes: state.boxes });
        renderBoxes();
        closeModal(DOM.addBoxModal);
      }
    });

    // Edit Box Modal Triggers & Handlers
    DOM.editBoxCloseBtn.addEventListener('click', () => closeModal(DOM.editBoxModal));
    DOM.btnCancelEditBox.addEventListener('click', () => closeModal(DOM.editBoxModal));
    DOM.editBoxModal.addEventListener('click', (e) => {
      if (e.target === DOM.editBoxModal) closeModal(DOM.editBoxModal);
    });

    DOM.editIconPickerGrid.querySelectorAll('.icon-choice').forEach((btn) => {
      btn.addEventListener('click', () => {
        DOM.editIconPickerGrid.querySelectorAll('.icon-choice').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        DOM.inputEditBoxIcon.value = btn.dataset.icon;
      });
    });

    DOM.editColorPickerGrid.querySelectorAll('.color-choice').forEach((btn) => {
      btn.addEventListener('click', () => {
        DOM.editColorPickerGrid.querySelectorAll('.color-choice').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        DOM.inputEditBoxColor.value = btn.dataset.color;
      });
    });

    DOM.editBoxForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const boxId = DOM.inputEditBoxId.value;
      const title = DOM.inputEditBoxTitle.value.trim();
      const icon = DOM.inputEditBoxIcon.value || '⚡';
      const color = DOM.inputEditBoxColor.value || 'cyan';

      const box = state.boxes.find((b) => b.id === boxId);
      if (box && title) {
        box.title = title;
        box.icon = icon;
        box.color = color;
        storageSet({ boxes: state.boxes });
        renderBoxes();
        closeModal(DOM.editBoxModal);
      }
    });

    DOM.btnDeleteCurrentBox.addEventListener('click', () => {
      const boxId = DOM.inputEditBoxId.value;
      if (boxId) deleteBox(boxId);
    });

    // Add Site Button in Header
    DOM.btnAddSite.addEventListener('click', () => {
      const boxSitesMap = getProcessedSitesForBoxes();
      const availableBox = state.boxes.find((b) => (boxSitesMap[b.id] || []).length < 4);
      if (!availableBox) {
        alert('All boxes have reached the maximum limit of 4 shortcuts. Please click "+ Add Box" to create a new category first, or delete a shortcut.');
        return;
      }
      openAddSiteModalForBox(availableBox.id);
    });
    DOM.addSiteCloseBtn.addEventListener('click', () => closeModal(DOM.addSiteModal));
    DOM.btnCancelAddSite.addEventListener('click', () => closeModal(DOM.addSiteModal));
    DOM.addSiteModal.addEventListener('click', (e) => {
      if (e.target === DOM.addSiteModal) closeModal(DOM.addSiteModal);
    });

    // Add Site Form Submit
    DOM.addSiteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = DOM.inputSiteTitle.value.trim();
      let url = DOM.inputSiteUrl.value.trim();
      const boxId = DOM.selectSiteBox.value;

      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      if (url) {
        const boxSitesMap = getProcessedSitesForBoxes();
        if ((boxSitesMap[boxId] || []).length >= 4) {
          const targetBox = state.boxes.find((b) => b.id === boxId);
          alert(`"${targetBox ? targetBox.title : 'Selected box'}" already contains the maximum allowed 4 shortcuts. Please choose another box or click "+ Add Box" to create a new category.`);
          return;
        }

        // Clean out if URL was stored previously to avoid duplicates
        state.customSites = state.customSites.filter((s) => s.url.replace(/\/+$/, '').toLowerCase() !== url.replace(/\/+$/, '').toLowerCase());
        state.customSites.unshift({ title, url, boxId });
        state.siteBoxMapping[url] = boxId;
        storageSet({
          customSites: state.customSites,
          siteBoxMapping: state.siteBoxMapping
        });
        renderBoxes();
        DOM.addSiteForm.reset();
        closeModal(DOM.addSiteModal);
      }
    });

    // Gallery Modal triggers
    DOM.btnGallery.addEventListener('click', openGallery);
    DOM.galleryCloseBtn.addEventListener('click', () => closeModal(DOM.galleryModal));
    DOM.galleryModal.addEventListener('click', (e) => {
      if (e.target === DOM.galleryModal) closeModal(DOM.galleryModal);
    });

    DOM.galleryTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        DOM.galleryTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        renderGallery(tab.dataset.tab);
      });
    });


    // Curated 4K Wallpaper Category Filter tags
    if (DOM.curatedTags) {
      DOM.curatedTags.forEach((tag) => {
        tag.addEventListener('click', () => {
          DOM.curatedTags.forEach((t) => t.classList.remove('active'));
          tag.classList.add('active');
          renderGallery('wallpapers', tag.dataset.curatedCat || 'all');
        });
      });
    }

    // Wallhaven Tag filters
    if (DOM.wallhavenTags) {
      DOM.wallhavenTags.forEach((tag) => {
        tag.addEventListener('click', () => {
          DOM.wallhavenTags.forEach((t) => t.classList.remove('active'));
          tag.classList.add('active');
          fetchWallhaven(tag.dataset.query, 1, false);
        });
      });
    }

    // Wallhaven Load More
    if (DOM.btnWallhavenLoadMore) {
      DOM.btnWallhavenLoadMore.addEventListener('click', () => {
        fetchWallhaven(state.wallhavenQuery, state.wallhavenPage + 1, true);
      });
    }

    DOM.btnRandomBg.addEventListener('click', cycleRandomBackground);
    DOM.btnGalleryRandom.addEventListener('click', () => {
      cycleRandomBackground();
      closeModal(DOM.galleryModal);
    });

    // Settings Modal triggers
    DOM.btnSettings.addEventListener('click', () => {
      if (DOM.settingsModal.classList.contains('open')) {
        closeModal(DOM.settingsModal);
      } else {
        openModal(DOM.settingsModal);
      }
    });
    DOM.settingsCloseBtn.addEventListener('click', () => closeModal(DOM.settingsModal));
    DOM.settingsModal.addEventListener('click', (e) => {
      if (e.target === DOM.settingsModal) closeModal(DOM.settingsModal);
    });

    [
      DOM.settingShowClock,
      DOM.settingShowSearch,
      DOM.settingShowDate,
      DOM.settingShowGreeting,
      DOM.setting24hClock,
      DOM.settingAdaptiveClock,
      DOM.settingLockWallpaper,
      DOM.settingClockStyle
    ].forEach((input) => {
      if (input) input.addEventListener('change', saveSettings);
    });

    if (DOM.btnLockWallpaper) {
      DOM.btnLockWallpaper.addEventListener('click', toggleWallpaperLock);
    }
    if (DOM.btnLockWallpaperGallery) {
      DOM.btnLockWallpaperGallery.addEventListener('click', toggleWallpaperLock);
    }

    // First-run Onboarding Banner Hint Toast Close
    if (DOM.btnCloseBannerHint) {
      DOM.btnCloseBannerHint.addEventListener('click', (e) => {
        e.preventDefault();
        dismissBannerHint();
      });
    }

    DOM.btnResetCache.addEventListener('click', async () => {
      if (confirm('Reset your boxes and shortcuts back to default?')) {
        state.hiddenUrls.clear();
        state.pinnedUrls.clear();
        state.siteBoxMapping = {};
        state.boxes = JSON.parse(JSON.stringify(DEFAULT_BOXES));
        state.customSites = JSON.parse(JSON.stringify(DEFAULT_CUSTOM_SITES));
        state.dockApps = JSON.parse(JSON.stringify(DEFAULT_DOCK_APPS));
        state.dockPinned = false;
        try {
          localStorage.removeItem('tabwai_banner_tip_seen');
        } catch (e) { }
        await storageSet({
          hiddenUrls: [],
          pinnedUrls: [],
          customSites: state.customSites,
          siteBoxMapping: {},
          boxes: state.boxes,
          dockApps: state.dockApps,
          dockPinned: false,
          bannerTipSeen: false
        });
        fetchAndRenderBoxes();
        MacAiDockEngine.render();
        MacAiDockEngine.syncPin();
        closeModal(DOM.settingsModal);
      }
    });

    // Close any open menus or soundscape flyout on outside click
    document.addEventListener('click', (e) => {
      document.querySelectorAll('.move-menu.open').forEach((m) => m.classList.remove('open'));
      if (DOM.soundscapeFlyout && !DOM.soundscapeFlyout.classList.contains('hidden')) {
        if (!DOM.soundscapeFlyout.contains(e.target) && (!DOM.btnSoundscape || !DOM.btnSoundscape.contains(e.target))) {
          DOM.soundscapeFlyout.classList.add('hidden');
          DOM.soundscapeFlyout.setAttribute('aria-hidden', 'true');
        }
      }
    });

    // Ambient Soundscapes Flyout & Controls
    if (DOM.btnSoundscape && DOM.soundscapeFlyout) {
      DOM.btnSoundscape.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = DOM.soundscapeFlyout.classList.contains('hidden');
        DOM.soundscapeFlyout.classList.toggle('hidden', !isHidden);
        DOM.soundscapeFlyout.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
      });

      if (DOM.soundscapeCloseBtn) {
        DOM.soundscapeCloseBtn.addEventListener('click', () => {
          DOM.soundscapeFlyout.classList.add('hidden');
          DOM.soundscapeFlyout.setAttribute('aria-hidden', 'true');
        });
      }

      DOM.soundscapeFlyout.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      if (DOM.btnSoundscapeToggle) {
        DOM.btnSoundscapeToggle.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          SoundscapeEngine.togglePlay();
        });
      }

      const presetsGrid = document.getElementById('soundscape-presets');
      if (presetsGrid) {
        presetsGrid.addEventListener('click', (e) => {
          const card = e.target.closest('.soundscape-card');
          if (!card) return;
          e.preventDefault();
          e.stopPropagation();
          const soundType = card.dataset.sound;
          SoundscapeEngine.startSound(soundType);
        });
      }

      // Sync UI on load
      SoundscapeEngine.updateUI();

      if (DOM.soundscapeVolume) {
        DOM.soundscapeVolume.addEventListener('input', (e) => {
          const val = parseInt(e.target.value, 10);
          SoundscapeEngine.setVolume(val / 100);
          if (DOM.soundscapeVolumeLabel) {
            DOM.soundscapeVolumeLabel.textContent = `${val}%`;
          }
        });
      }

      if (DOM.soundscapeTimerPills) {
        DOM.soundscapeTimerPills.forEach((pill) => {
          pill.addEventListener('click', () => {
            DOM.soundscapeTimerPills.forEach((p) => p.classList.remove('active'));
            pill.classList.add('active');
            const mins = parseInt(pill.dataset.time, 10) || 0;
            SoundscapeEngine.setTimerMinutes(mins);
          });
        });
      }
    }

    // Open Incognito Window & Tab
    if (DOM.btnIncognito) {
      DOM.btnIncognito.addEventListener('click', openIncognito);
    }

    // Toggle Fullscreen
    DOM.btnToggleFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => { });
      } else {
        document.exitFullscreen().catch(() => { });
      }
    });

    // Global Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = activeTag === 'input' || activeTag === 'textarea';

      if (e.key === 'Escape') {
        if (DOM.soundscapeFlyout && !DOM.soundscapeFlyout.classList.contains('hidden')) {
          DOM.soundscapeFlyout.classList.add('hidden');
          DOM.soundscapeFlyout.setAttribute('aria-hidden', 'true');
        } else if (DOM.galleryModal.classList.contains('open')) {
          closeModal(DOM.galleryModal);
        } else if (DOM.settingsModal.classList.contains('open')) {
          closeModal(DOM.settingsModal);
        } else if (DOM.addSiteModal.classList.contains('open')) {
          closeModal(DOM.addSiteModal);
        } else if (DOM.addBoxModal.classList.contains('open')) {
          closeModal(DOM.addBoxModal);
        } else if (DOM.editBoxModal.classList.contains('open')) {
          closeModal(DOM.editBoxModal);
        } else if (DOM.modalDockApp && DOM.modalDockApp.classList.contains('open')) {
          closeModal(DOM.modalDockApp);
        } else if (state.dockEditing) {
          MacAiDockEngine.exitEditMode();
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      if (isInput) return;

      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        DOM.dashboardSection.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'w' || e.key === 'W') {
        cycleRandomBackground();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        toggleWallpaperLock();
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        openIncognito();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        SoundscapeEngine.togglePlay();
      } else if (e.key === '/') {
        e.preventDefault();
        if (DOM.googleSearchInput) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          DOM.googleSearchInput.focus();
        }
      }
    });
  }

  // Launch on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
