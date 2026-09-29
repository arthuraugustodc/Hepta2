const menuButton = document.querySelector('[data-menu-button]');
const navigation = document.querySelector('[data-navigation]');

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navigation.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

document.querySelectorAll('.faq-question').forEach((button) => {
  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq-question').forEach((item) => item.setAttribute('aria-expanded', 'false'));
    button.setAttribute('aria-expanded', String(!isOpen));
  });
});

const journey = document.querySelector('[data-journey]');

if (journey) {
  const steps = Array.from(journey.querySelectorAll('[data-journey-step]'));
  const detail = journey.querySelector('[data-journey-detail]');
  const detailNumber = journey.querySelector('[data-journey-detail-number]');
  const detailTitle = journey.querySelector('[data-journey-detail-title]');
  const detailDescription = journey.querySelector('[data-journey-detail-description]');
  let detailAnimationTimer;

  const selectStep = (selectedStep) => {
    steps.forEach((step) => {
      const isSelected = step === selectedStep;
      step.classList.toggle('is-active', isSelected);
      step.setAttribute('aria-expanded', String(isSelected));
    });

    detailNumber.textContent = `Etapa ${selectedStep.dataset.number}`;
    detailTitle.textContent = selectedStep.dataset.title;
    detailDescription.textContent = selectedStep.dataset.description;

    window.clearTimeout(detailAnimationTimer);
    detail.classList.remove('is-updating');
    void detail.offsetWidth;
    detail.classList.add('is-updating');
    detailAnimationTimer = window.setTimeout(() => detail.classList.remove('is-updating'), 380);
  };

  steps.forEach((step, index) => {
    step.addEventListener('click', () => selectStep(step));
    step.addEventListener('keydown', (event) => {
      const isPrevious = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
      const isNext = event.key === 'ArrowRight' || event.key === 'ArrowDown';
      if (!isPrevious && !isNext && event.key !== 'Home' && event.key !== 'End') return;

      event.preventDefault();
      let nextIndex = index;
      if (isPrevious) nextIndex = (index - 1 + steps.length) % steps.length;
      if (isNext) nextIndex = (index + 1) % steps.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = steps.length - 1;

      steps[nextIndex].focus();
      selectStep(steps[nextIndex]);
    });
  });
}

const valueCarousel = document.querySelector('[data-value-carousel]');

if (valueCarousel) {
  const section = valueCarousel.closest('.values');
  const track = valueCarousel.querySelector('[data-value-track]');
  const cards = Array.from(track.querySelectorAll('.value-card'));
  const previousButton = section.querySelector('[data-carousel-prev]');
  const nextButton = section.querySelector('[data-carousel-next]');
  const dotsContainer = section.querySelector('[data-carousel-dots]');
  const status = section.querySelector('[data-carousel-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollModeQuery = window.matchMedia('(min-width: 769px) and (min-height: 650px)');
  let currentIndex = 0;
  let maximumIndex = cards.length - 1;
  let autoplayTimer;
  let resizeTimer;
  let scrollFrame;
  let touchStartX = 0;
  let isInView = false;

  section.classList.add('carousel-enhanced');

  const stopAutoplay = () => {
    window.clearInterval(autoplayTimer);
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (!isInView || reducedMotion.matches || maximumIndex === 0 || section.classList.contains('scroll-carousel')) return;
    autoplayTimer = window.setInterval(() => {
      showSlide(currentIndex === maximumIndex ? 0 : currentIndex + 1);
    }, 3200);
  };

  const renderDots = () => {
    dotsContainer.replaceChildren();
    for (let index = 0; index <= maximumIndex; index += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Mostrar item ${index + 1} do carrossel`);
      dot.addEventListener('click', () => {
        navigateToSlide(index);
      });
      dotsContainer.append(dot);
    }
  };

  const showSlide = (requestedIndex) => {
    currentIndex = (requestedIndex + cards.length) % cards.length;
    const previousIndex = (currentIndex - 1 + cards.length) % cards.length;
    const nextIndex = (currentIndex + 1) % cards.length;

    cards.forEach((card, index) => {
      card.classList.toggle('is-current', index === currentIndex);
      card.classList.toggle('is-previous', index === previousIndex);
      card.classList.toggle('is-next', index === nextIndex);
      card.setAttribute('aria-hidden', String(index !== currentIndex));
      card.tabIndex = index === currentIndex ? 0 : -1;
    });

    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    status.textContent = `Item ${currentIndex + 1} de ${cards.length}`;
  };

  const getHeaderHeight = () => Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')) || 0;

  const updateSlideFromScroll = () => {
    scrollFrame = 0;
    if (!section.classList.contains('scroll-carousel')) return;

    const headerHeight = getHeaderHeight();
    const sectionRect = section.getBoundingClientRect();
    const visibleHeight = window.innerHeight - headerHeight;
    const scrollDistance = Math.max(1, section.offsetHeight - visibleHeight);
    const progress = Math.min(1, Math.max(0, (headerHeight - sectionRect.top) / scrollDistance));
    const nextIndex = Math.min(maximumIndex, Math.round(progress * maximumIndex));

    if (nextIndex !== currentIndex) showSlide(nextIndex);
  };

  const requestScrollUpdate = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateSlideFromScroll);
  };

  const navigateToSlide = (requestedIndex) => {
    const nextIndex = (requestedIndex + cards.length) % cards.length;
    if (!section.classList.contains('scroll-carousel')) {
      showSlide(nextIndex);
      startAutoplay();
      return;
    }

    const headerHeight = getHeaderHeight();
    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    const visibleHeight = window.innerHeight - headerHeight;
    const scrollDistance = Math.max(1, section.offsetHeight - visibleHeight);
    const progress = maximumIndex === 0 ? 0 : nextIndex / maximumIndex;
    window.scrollTo({
      top: sectionTop - headerHeight + scrollDistance * progress,
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
  };

  const configureScrollMode = () => {
    const isEnabled = scrollModeQuery.matches && !reducedMotion.matches;
    section.classList.toggle('scroll-carousel', isEnabled);
    if (isEnabled) {
      section.style.setProperty('--carousel-scroll-distance', `${Math.max(1, cards.length - 1) * 42}svh`);
      stopAutoplay();
      requestScrollUpdate();
    } else {
      section.style.removeProperty('--carousel-scroll-distance');
      startAutoplay();
    }
  };

  const configureCarousel = () => {
    maximumIndex = cards.length - 1;
    renderDots();
    showSlide(currentIndex);
  };

  previousButton.addEventListener('click', () => {
    navigateToSlide(currentIndex === 0 ? maximumIndex : currentIndex - 1);
  });

  nextButton.addEventListener('click', () => {
    navigateToSlide(currentIndex === maximumIndex ? 0 : currentIndex + 1);
  });

  valueCarousel.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = currentIndex + direction;
    navigateToSlide(nextIndex > maximumIndex ? 0 : nextIndex < 0 ? maximumIndex : nextIndex);
  });

  valueCarousel.addEventListener('pointerenter', stopAutoplay);
  valueCarousel.addEventListener('pointerleave', startAutoplay);
  section.addEventListener('focusin', stopAutoplay);
  section.addEventListener('focusout', () => window.setTimeout(() => {
    if (!section.contains(document.activeElement)) startAutoplay();
  }, 0));

  valueCarousel.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
    stopAutoplay();
  }, { passive: true });

  valueCarousel.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) {
      const nextIndex = distance < 0 ? currentIndex + 1 : currentIndex - 1;
      navigateToSlide(nextIndex > maximumIndex ? 0 : nextIndex < 0 ? maximumIndex : nextIndex);
    }
    startAutoplay();
  }, { passive: true });

  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      configureCarousel();
      configureScrollMode();
    }, 160);
  });

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });

  const observer = new IntersectionObserver((entries) => {
    isInView = entries[0].isIntersecting;
    if (isInView) {
      section.classList.add('carousel-visible');
      window.setTimeout(() => section.classList.add('carousel-running'), 900);
      window.setTimeout(startAutoplay, 1100);
    } else {
      stopAutoplay();
    }
  }, { threshold: .2 });

  configureCarousel();
  configureScrollMode();
  observer.observe(section);
}
