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
  let currentIndex = 0;
  let maximumIndex = cards.length - 1;
  let autoplayTimer;
  let resizeTimer;
  let touchStartX = 0;
  let isInView = false;

  section.classList.add('carousel-enhanced');

  const stopAutoplay = () => {
    window.clearInterval(autoplayTimer);
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (!isInView || reducedMotion.matches || maximumIndex === 0) return;
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
        showSlide(index);
        startAutoplay();
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
    });

    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    status.textContent = `Item ${currentIndex + 1} de ${cards.length}`;
  };

  const configureCarousel = () => {
    maximumIndex = cards.length - 1;
    renderDots();
    showSlide(currentIndex);
  };

  previousButton.addEventListener('click', () => {
    showSlide(currentIndex === 0 ? maximumIndex : currentIndex - 1);
    startAutoplay();
  });

  nextButton.addEventListener('click', () => {
    showSlide(currentIndex === maximumIndex ? 0 : currentIndex + 1);
    startAutoplay();
  });

  valueCarousel.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = currentIndex + direction;
    showSlide(nextIndex > maximumIndex ? 0 : nextIndex < 0 ? maximumIndex : nextIndex);
    startAutoplay();
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
      showSlide(nextIndex > maximumIndex ? 0 : nextIndex < 0 ? maximumIndex : nextIndex);
    }
    startAutoplay();
  }, { passive: true });

  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      configureCarousel();
      startAutoplay();
    }, 160);
  });

  const observer = new IntersectionObserver((entries) => {
    isInView = entries[0].isIntersecting;
    if (isInView) {
      section.classList.add('carousel-visible');
      window.setTimeout(() => section.classList.add('carousel-running'), 900);
      window.setTimeout(startAutoplay, 1100);
    } else {
      stopAutoplay();
    }
  }, { threshold: .35 });

  configureCarousel();
  observer.observe(section);
}
