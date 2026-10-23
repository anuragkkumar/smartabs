// Tabwai Instant Appearance Preloader
// Synchronously restores visual preferences (clock style capsule, light theme) before first paint
(function () {
  try {
    const cachedStyle = localStorage.getItem('tabwai_clock_style');
    if (cachedStyle) {
      document.documentElement.setAttribute('data-clock-style', cachedStyle);
    }
    const cachedTheme = localStorage.getItem('tabwai_clock_theme');
    if (cachedTheme === 'light') {
      document.documentElement.classList.add('clock-theme-light');
      document.documentElement.setAttribute('data-clock-theme', 'light');
    }

    document.addEventListener('DOMContentLoaded', function () {
      try {
        if (document.documentElement.classList.contains('clock-theme-light') && document.body) {
          document.body.classList.add('clock-theme-light');
        }
        const cStyle = localStorage.getItem('tabwai_clock_style');
        const container = document.getElementById('clock-container');
        if (container && cStyle === 'capsule') {
          container.classList.add('style-capsule');
        }
      } catch (e) {}
    });
  } catch (e) {
    // localStorage may be restricted in rare contexts
  }
})();
