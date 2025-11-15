// Intro overlay controller
(function(){
  const overlayId = 'site-intro-overlay';
  const videoSelector = '#intro-video';
  const skipSelector = '#intro-skip-btn';

  function lazyLoadMain() {
    // Reveal the rest of the page (if anything was hidden)
    document.documentElement.classList.remove('intro-active');
  }

  function endIntro() {
    const overlay = document.getElementById(overlayId);
    if(!overlay) return;
    overlay.classList.add('fade-out');
    // Wait for animation then remove overlay from DOM
    overlay.addEventListener('animationend', () => {
      // mark intro as seen so returning visitors skip it
      try { localStorage.setItem('campus_intro_seen', '1'); } catch (e) { /* storage unavailable */ }
      overlay.remove();
      lazyLoadMain();
    }, { once: true });
  }

  function initIntro() {
      const video = document.querySelector(videoSelector);

      if (!video) {
        // No video, just end immediately
        setTimeout(endIntro, 250);
        return;
      }

      // Ensure video plays muted and inline (required for autoplay on mobile)
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');

      // Check if intro.mp4 exists before attempting to play
      if (video) {
        if (!video.src || video.src.includes('intro.mp4') && !document.querySelector('source[src="assets/intro.mp4"]')) {
          console.error('intro.mp4 not found in DOM or path issue');
          endIntro();
          return;
        }
        video.addEventListener('error', (e) => {
          console.error('Video load error (intro.mp4):', e);
          endIntro(); // Skip intro if video fails to load
          const error = new Error(`Failed to load intro.mp4: ${e.message}`);
          console.error(error);
          try {
            fetch('assets/intro.mp4')
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Failed to load intro.mp4: ${response.statusText}`);
                }
              })
              .catch(error => {
                console.error(`Failed to load intro.mp4: ${error.message}`);
              });
          } catch (error) {
            console.error(`Failed to load intro.mp4: ${error.message}`);
          }
        });
      }

      // When the video ends, fade out the intro
      video.addEventListener('ended', () => {
        endIntro();
      });

      // If the video starts playing, we don't need fallback
      let fallbackTimeout = setTimeout(() => {
        // Fallback: if autoplay doesn't start, end intro after short delay
        endIntro();
      }, 5000);

      video.addEventListener('playing', () => {
        clearTimeout(fallbackTimeout);
      });

      // Try to play (wrapped in promise because browsers may block autoplay)
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {
          // If play was blocked, keep it muted and try once more; otherwise end
          video.muted = true;
          video.play().catch(() => setTimeout(endIntro, 300));
        });
      }
  }

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    // Respect users who prefer reduced motion — skip intro
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If intro already shown, skip it
    const introSeen = localStorage.getItem('campus_intro_seen');

    if (!document.getElementById(overlayId) || prefersReduced || introSeen === '1') {
      // Ensure page content is visible and remove overlay if present
      const existing = document.getElementById(overlayId);
      if (existing) existing.remove();
      document.documentElement.classList.remove('intro-active');
      return;
    }

    // Add a class to allow CSS to hide heavy content if needed
    document.documentElement.classList.add('intro-active');
    initIntro();
  });
})();