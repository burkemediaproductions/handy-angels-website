(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile drawer
  const openBtn = document.querySelector('[data-mobile-open]');
  const panel = document.querySelector('[data-mobile-panel]');
  const closeBtn = document.querySelector('[data-mobile-close]');
  const drawer = document.querySelector('[data-mobile-drawer]');

  let lastFocus = null;

	function openDrawer(){
	  if(!panel) return;
	  lastFocus = document.activeElement;
	  panel.setAttribute('aria-hidden','false');
	  document.body.style.overflow='hidden';
	  document.body.classList.add('menu-open');

	  const first = drawer?.querySelector('a,button');
	  setTimeout(() => first?.focus(), 180);
	}

	function closeDrawer(){
	  if(!panel) return;
	  panel.setAttribute('aria-hidden','true');

	  window.setTimeout(() => {
		document.body.style.overflow='';
		document.body.classList.remove('menu-open');
		if(lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
	  }, 320);
	}

  openBtn?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  panel?.addEventListener('click', (e)=>{
    if(e.target === panel) closeDrawer();
  });

  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && panel?.getAttribute('aria-hidden') === 'false'){
      closeDrawer();
    }
  });

  // Trap focus inside drawer when open
  document.addEventListener('keydown', (e)=>{
    if(e.key !== 'Tab') return;
    if(panel?.getAttribute('aria-hidden') !== 'false') return;
    const focusables = drawer?.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if(!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length-1];
    if(e.shiftKey && document.activeElement === first){
      e.preventDefault();
      last.focus();
    } else if(!e.shiftKey && document.activeElement === last){
      e.preventDefault();
      first.focus();
    }
  });

  // Year
  const yearEl = document.querySelector('[data-year]');
  if(yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Disable autoplay-heavy features when reduced motion
  document.documentElement.dataset.reducedMotion = prefersReduced ? 'true' : 'false';


  // Subtle parallax for the hero wave divider
  const parallaxDividers = document.querySelectorAll('[data-parallax-divider]');
  if(parallaxDividers.length && !prefersReduced){
    let ticking = false;

    function updateDividerParallax(){
      parallaxDividers.forEach((divider)=>{
        const parent = divider.closest('.hero, .section');
        if(!parent) return;
        const rect = parent.getBoundingClientRect();
        const offset = Math.max(-8, Math.min(8, rect.top * -0.02));
        divider.style.setProperty('--divider-parallax-offset', `${offset.toFixed(2)}px`);
      });
      ticking = false;
    }

    function requestDividerParallax(){
      if(ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateDividerParallax);
    }

    updateDividerParallax();
    window.addEventListener('scroll', requestDividerParallax, { passive:true });
    window.addEventListener('resize', requestDividerParallax);
  }

})();

// Force-play muted decorative videos when possible
document.querySelectorAll('.inline-video').forEach((video) => {
  video.muted = true;
  const tryPlay = () => {
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  };

  if (video.readyState >= 2) {
    tryPlay();
  } else {
    video.addEventListener('loadeddata', tryPlay, { once: true });
  }
});

// Faux-fixed background for About section
(function(){
  const aboutSection = document.querySelector('.frntabout');
  if(!aboutSection) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced) return;

  let ticking = false;

  function updateAboutBg(){
    const rect = aboutSection.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;

    // Only animate while near viewport
    if(rect.bottom > -200 && rect.top < viewportH + 200){
      const offset = Math.max(-60, Math.min(60, rect.top * -0.12));
      aboutSection.style.setProperty('--about-bg-offset', `${offset.toFixed(2)}px`);
    }

    ticking = false;
  }

  function requestUpdate(){
    if(ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateAboutBg);
  }

  updateAboutBg();
  window.addEventListener('scroll', requestUpdate, { passive:true });
  window.addEventListener('resize', requestUpdate);
})();