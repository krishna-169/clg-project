// Lazy loader for non-critical scripts and service worker registration
(function() {
  function loadScript(src, attrs = {}) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.defer = true;
      Object.keys(attrs).forEach(k => s.setAttribute(k, attrs[k]));
      s.onload = () => resolve(src);
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.body.appendChild(s);
    });
  }

  // Load non-critical scripts after first paint / idle time
  function loadNonCritical() {
    // small delay to let first paint happen
    if ('requestIdleCallback' in window) {
      requestIdleCallback(async () => {
        try {
          await loadScript('js/menu.js');
          await loadScript('js/responsive.js');
        } catch (e) {
          console.warn('Loader: some scripts failed to load', e);
        }
      }, {timeout: 2000});
    } else {
      setTimeout(async () => {
        try {
          await loadScript('js/menu.js');
          await loadScript('js/responsive.js');
        } catch (e) {
          console.warn('Loader: some scripts failed to load', e);
        }
      }, 500);
    }
  }

  // Register a simple service worker (if available)
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      // Use a relative path so it works on localhost and file scopes
      navigator.serviceWorker.register('sw.js').then(reg => {
        console.log('ServiceWorker registered', reg);
      }).catch(err => {
        console.warn('ServiceWorker registration failed:', err);
      });
    }
  }

  // Start loading after DOMContentLoaded / first paint
  window.addEventListener('load', () => {
    loadNonCritical();
    registerServiceWorker();
  });
})();
