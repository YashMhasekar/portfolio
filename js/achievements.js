// ============================================
// ACHIEVEMENTS & TEAMS — Marquee Module
// Builds the infinite photo marquee for section 5.
// Zero external dependencies — pure vanilla JS.
// ============================================

// ============================================
// 1. IMAGE REGISTRY
//    All images that exist in public/.
//    To add a new photo: append its path here.
// ============================================

const ACHIEVEMENT_IMAGES = [
  { src: 'public/i1.jpeg', alt: 'Yash Mhasekar achievement and team photograph' },
  { src: 'public/i2.jpeg', alt: 'Yash Mhasekar achievement and team photograph' },
  { src: 'public/i3.jpeg', alt: 'Yash Mhasekar achievement and team photograph' },
  { src: 'public/i4.jpeg', alt: 'Yash Mhasekar achievement and team photograph' },
  { src: 'public/i5.jpeg', alt: 'Yash Mhasekar achievement and team photograph' },
  { src: 'public/i6.jpeg', alt: 'Yash Mhasekar achievement and team photograph' },
  { src: 'public/i7.jpeg', alt: 'Yash Mhasekar achievement and team photograph' },
  { src: 'public/i8.jpeg', alt: 'Yash Mhasekar achievement and team photograph' },
];

// ============================================
// 2. SPEED CONFIGURATION (px / second)
// ============================================

const SCROLL_SPEED_PX_PER_SEC = 55;

// ============================================
// 3. REDUCED MOTION DETECTION
// ============================================

function prefersReducedMotion() {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.body.classList.contains('reduced-motion')
  );
}

// ============================================
// 4. BUILD A SINGLE CARD ELEMENT
//    The card has NO fixed height — the img
//    renders at its natural aspect ratio so
//    portrait photos are shown in full without
//    any cropping.
// ============================================

function buildCard(imgData) {
  const card = document.createElement('div');
  card.className = 'ach-card';
  card.setAttribute('role', 'img');
  card.setAttribute('aria-label', imgData.alt);

  const img = document.createElement('img');
  img.src       = imgData.src;
  img.alt       = imgData.alt;
  img.loading   = 'lazy';
  img.decoding  = 'async';
  img.draggable = false;

  // Once the image dimensions are known, tag portrait cards so
  // they can be styled with a tighter width cap if needed
  img.addEventListener('load', () => {
    if (img.naturalHeight > img.naturalWidth) {
      card.classList.add('ach-card--portrait');
    }
  });

  // Graceful fallback: hide card if image 404s
  img.addEventListener('error', () => {
    card.style.display = 'none';
  });

  card.appendChild(img);
  return card;
}

// ============================================
// 5. PRELOAD ALL IMAGES
//    Returns a Promise that resolves once every
//    image in the list has loaded (or errored).
//    This ensures the track has its real width
//    before we measure it for the animation.
// ============================================

function preloadImages() {
  return Promise.all(
    ACHIEVEMENT_IMAGES.map(imgData => {
      return new Promise(resolve => {
        const img = new Image();
        img.onload  = resolve;
        img.onerror = resolve; // don't block on broken images
        img.src     = imgData.src;
      });
    })
  );
}

// ============================================
// 6. BUILD THE MARQUEE
//    Creates Set A + Set B for seamless loop.
// ============================================

function buildMarquee() {
  const track = document.getElementById('ach-marquee-track');
  if (!track || ACHIEVEMENT_IMAGES.length === 0) return;

  if (prefersReducedMotion()) {
    // Reduced motion: single static set, no animation
    ACHIEVEMENT_IMAGES.forEach(imgData => track.appendChild(buildCard(imgData)));
    _revealSection();
    return;
  }

  // Set A
  ACHIEVEMENT_IMAGES.forEach(imgData => track.appendChild(buildCard(imgData)));
  // Set B — exact duplicate for seamless loop
  ACHIEVEMENT_IMAGES.forEach(imgData => track.appendChild(buildCard(imgData)));

  // Wait for images to load before measuring, so portrait images
  // contribute their real height to the layout
  preloadImages().then(() => {
    // Two rAFs: first lets the browser reflow after load events,
    // second ensures the computed layout is stable
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        _configureAnimation(track);
      });
    });
  });
}

// ============================================
// 7. CONFIGURE ANIMATION
//    Reads the measured single-set width and
//    sets the CSS vars the @keyframes uses.
// ============================================

function _configureAnimation(track) {
  const totalWidth = track.scrollWidth;
  const singleSetW = Math.round(totalWidth / 2);
  if (singleSetW < 1) return;

  const durationSec = singleSetW / SCROLL_SPEED_PX_PER_SEC;

  track.style.setProperty('--ach-set-w',    `${singleSetW}px`);
  track.style.setProperty('--ach-duration', `${durationSec.toFixed(2)}s`);
}

// ============================================
// 8. REVEAL SECTION (entry animation)
// ============================================

function _revealSection() {
  const outer  = document.querySelector('.ach-marquee-outer');
  const header = document.querySelector('.ach-header');
  const footer = document.querySelector('.ach-footer-line');
  if (header) header.classList.add('ach-visible');
  if (outer)  outer.classList.add('ach-visible');
  if (footer) footer.classList.add('ach-visible');
}

function setupEntryAnimation() {
  const section = document.getElementById('achievements-overlay');
  if (!section) return;

  if (!window.IntersectionObserver) {
    _revealSection();
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          _revealSection();
          observer.unobserve(section);
        }
      });
    },
    { threshold: 0.2 }
  );
  observer.observe(section);

  // Fixed-overlay architecture: section is always in viewport
  // but opacity:0 — watch for .active class from goToSection()
  const mutationObs = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class' &&
        section.classList.contains('active')
      ) {
        setTimeout(_revealSection, 150);
        mutationObs.disconnect();
      }
    });
  });
  mutationObs.observe(section, { attributes: true });
}

// ============================================
// 9. TOUCH PAUSE (mobile)
// ============================================

function setupTouchPause() {
  const outer = document.querySelector('.ach-marquee-outer');
  const track = document.getElementById('ach-marquee-track');
  if (!outer || !track) return;

  let touchStartX = 0;
  let touchStartY = 0;

  outer.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    track.classList.add('ach-paused');
  }, { passive: true });

  outer.addEventListener('touchend',    () => track.classList.remove('ach-paused'), { passive: true });
  outer.addEventListener('touchcancel', () => track.classList.remove('ach-paused'), { passive: true });

  // Resume if user is clearly scrolling vertically
  outer.addEventListener('touchmove', e => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (dy > dx * 1.5) track.classList.remove('ach-paused');
  }, { passive: true });
}

// ============================================
// 10. RESIZE / ORIENTATION
// ============================================

function setupResizeHandler() {
  const track = document.getElementById('ach-marquee-track');
  if (!track) return;

  let timer = null;
  const onResize = () => {
    clearTimeout(timer);
    timer = setTimeout(() => _configureAnimation(track), 200);
  };

  window.addEventListener('resize',            onResize,                              { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(onResize, 300),       { passive: true });
}

// ============================================
// 11. WATCH OS REDUCED-MOTION TOGGLE
// ============================================

function watchReducedMotion() {
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
    const track = document.getElementById('ach-marquee-track');
    if (!track) return;
    track.innerHTML = '';
    buildMarquee();
  });
}

// ============================================
// 12. BOOTSTRAP
// ============================================

function initAchievements() {
  buildMarquee();
  setupEntryAnimation();
  setupTouchPause();
  setupResizeHandler();
  watchReducedMotion();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAchievements);
} else {
  initAchievements();
}
