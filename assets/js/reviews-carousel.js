// Reviews carousel
(function(){
  const root = document.querySelector('[data-reviews-carousel]');
  if(!root) return;

  const slides = Array.from(root.querySelectorAll('[data-review-slide]'));
  const prevBtn = root.querySelector('[data-reviews-prev]');
  const nextBtn = root.querySelector('[data-reviews-next]');
  const dotsWrap = root.querySelector('.reviews-dots');
  const live = root.querySelector('[data-reviews-live]');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(!slides.length) return;

  let current = 0;
  let timer = null;
  let isAnimating = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  const autoplayDelay = 6500;
  root.style.setProperty('--review-delay', autoplayDelay + 'ms');

  function buildDots(){
    slides.forEach((_, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'reviews-dot' + (index === 0 ? ' is-active' : '');
      btn.setAttribute('aria-label', `Go to review ${index + 1}`);
      btn.addEventListener('click', () => {
        goTo(index, index > current ? 'next' : 'prev');
        startAutoplay();
      });
      dotsWrap?.appendChild(btn);
    });
  }

  function updateDots(){
    const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.reviews-dot')) : [];
    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === current);
    });
  }

  function updateLive(){
    const name = slides[current].querySelector('h3')?.textContent?.trim() || `Review ${current + 1}`;
    if(live) live.textContent = `Showing review ${current + 1} of ${slides.length}: ${name}`;
  }

  function goTo(nextIndex, direction = 'next'){
    if(isAnimating || nextIndex === current) return;
    isAnimating = true;

    const currentSlide = slides[current];
    const nextSlide = slides[nextIndex];

    currentSlide.classList.remove('is-leaving-next', 'is-leaving-prev');
    nextSlide.classList.remove('is-leaving-next', 'is-leaving-prev');

    currentSlide.classList.add(direction === 'next' ? 'is-leaving-next' : 'is-leaving-prev');
    currentSlide.classList.remove('is-active');
    nextSlide.classList.add('is-active');

    current = nextIndex;
    updateDots();
    updateLive();

    window.setTimeout(() => {
      slides.forEach((slide, index) => {
        slide.classList.remove('is-leaving-next', 'is-leaving-prev');
        slide.classList.toggle('is-active', index === current);
      });
      isAnimating = false;
    }, prefersReduced ? 50 : 800);
  }

  function next(){
    goTo((current + 1) % slides.length, 'next');
  }

  function prev(){
    goTo((current - 1 + slides.length) % slides.length, 'prev');
  }

  function stopAutoplay(){
    if(timer){
      window.clearInterval(timer);
      timer = null;
    }
  }

  function startAutoplay(){
    if(prefersReduced) return;
    stopAutoplay();
    timer = window.setInterval(next, autoplayDelay);
  }

  function handleSwipe(){
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if(Math.abs(deltaY) > Math.abs(deltaX)) return;
    if(Math.abs(deltaX) < 50) return;

    if(deltaX < 0){
      next();
    } else {
      prev();
    }

    startAutoplay();
  }

  prevBtn?.addEventListener('click', () => {
    prev();
    startAutoplay();
  });

  nextBtn?.addEventListener('click', () => {
    next();
    startAutoplay();
  });

  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', startAutoplay);
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('focusout', startAutoplay);

  root.addEventListener('touchstart', (e) => {
    const touch = e.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  root.addEventListener('touchend', (e) => {
    const touch = e.changedTouches[0];
    touchEndX = touch.clientX;
    touchEndY = touch.clientY;
    handleSwipe();
  }, { passive: true });

  buildDots();
  updateDots();
  updateLive();
  startAutoplay();
})();