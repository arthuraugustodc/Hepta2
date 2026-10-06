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
  let checkpointTimer;
  let currentStepIndex = Math.max(0, steps.findIndex((step) => step.classList.contains('is-active')));
  let isJourneyInView = false;

  const selectStep = (selectedStep) => {
    currentStepIndex = steps.indexOf(selectedStep);
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

  const stopCheckpointRotation = () => {
    window.clearInterval(checkpointTimer);
  };

  const startCheckpointRotation = () => {
    stopCheckpointRotation();
    if (!isJourneyInView || document.hidden || steps.length < 2) return;

    checkpointTimer = window.setInterval(() => {
      currentStepIndex = (currentStepIndex + 1) % steps.length;
      selectStep(steps[currentStepIndex]);
    }, 3000);
  };

  steps.forEach((step, index) => {
    step.addEventListener('click', () => {
      selectStep(step);
      startCheckpointRotation();
    });
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
      startCheckpointRotation();
    });
  });

  const journeyObserver = new IntersectionObserver((entries) => {
    isJourneyInView = entries[0].isIntersecting;
    if (isJourneyInView) startCheckpointRotation();
    else stopCheckpointRotation();
  }, { threshold: .15 });

  journeyObserver.observe(journey);
  document.addEventListener('visibilitychange', startCheckpointRotation);
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

const proofSection = document.querySelector('.proof');

if (proofSection) {
  const numbers = Array.from(proofSection.querySelectorAll('[data-count-target]'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const formatNumber = (element, value) => {
    const prefix = element.dataset.countPrefix || '';
    const suffix = element.dataset.countSuffix || '';
    return `${prefix}${Math.round(value).toLocaleString('pt-BR')}${suffix}`;
  };

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    numbers.forEach((number, index) => {
      number.dataset.countFinal = number.textContent;
      number.textContent = formatNumber(number, 0);
      number.style.setProperty('--count-delay', `${index * 110}ms`);
    });

    const animateNumber = (number, index) => {
      const target = Number(number.dataset.countTarget);
      const duration = 1150;

      window.setTimeout(() => {
        const start = performance.now();

        const update = (now) => {
          const progress = Math.min(1, (now - start) / duration);
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          number.textContent = formatNumber(number, target * easedProgress);

          if (progress < 1) {
            window.requestAnimationFrame(update);
          } else {
            number.textContent = number.dataset.countFinal;
          }
        };

        window.requestAnimationFrame(update);
      }, index * 110);
    };

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      proofSection.classList.add('is-counting');
      numbers.forEach(animateNumber);
      observer.disconnect();
    }, { threshold: .3, rootMargin: '0px 0px -8% 0px' });

    observer.observe(proofSection);
  }
}

const sectorDialog = document.querySelector('[data-sector-dialog]');

if (sectorDialog) {
  const sectorDetails = {
    estrategia: {
      description: 'Conectamos indicadores, sistemas e decisões em uma visão executiva única para tornar a gestão mais previsível e orientada por dados.',
      examples: ['Cockpit executivo unificado', 'BI prescritivo para planos de ação', 'Governança corporativa automatizada']
    },
    financeiro: {
      description: 'Automatizamos rotinas financeiras e criamos inteligência para reduzir erros, antecipar riscos e melhorar a previsibilidade do caixa.',
      examples: ['Previsão integrada de receita', 'Auditoria contábil automatizada', 'Faturamento ponta a ponta']
    },
    comercial: {
      description: 'Estruturamos tecnologia para organizar o funil, priorizar oportunidades e dar ao time comercial mais contexto para vender melhor.',
      examples: ['CRM conversacional com IA', 'Distribuição inteligente de leads', 'Previsibilidade de vendas e receita']
    },
    marketing: {
      description: 'Integramos campanhas, canais e resultados para transformar dados de marketing em decisões claras sobre investimento e crescimento.',
      examples: ['Atribuição omnichannel', 'Planejamento preditivo de orçamento', 'Orquestração de campanhas e fluxos']
    },
    atendimento: {
      description: 'Unificamos histórico, suporte e sinais de relacionamento para oferecer respostas mais rápidas e agir antes que um cliente se perca.',
      examples: ['Atendimento contextual com IA', 'Alerta de risco de churn', 'Base de conhecimento viva']
    },
    operacoes: {
      description: 'Conectamos processos e sistemas para revelar gargalos, automatizar decisões repetitivas e aumentar a capacidade operacional.',
      examples: ['Orquestração de processos', 'BI operacional de gargalos', 'Gestão inteligente de capacidade']
    },
    rh: {
      description: 'Digitalizamos a jornada das pessoas para simplificar solicitações, acessos, documentos e rotinas internas com mais segurança.',
      examples: ['Onboarding digital automatizado', 'Central de solicitações internas', 'Governança automática de acessos']
    },
    dados: {
      description: 'Organizamos e conectamos os dados da empresa para garantir qualidade, acesso seguro e inteligência pronta para apoiar decisões.',
      examples: ['Data lakehouse corporativo', 'BI conversacional', 'Automação de qualidade e pipelines']
    }
  };

  const cards = document.querySelectorAll('.preview-card[data-sector]');
  const sheet = sectorDialog.querySelector('.sector-sheet');
  const closeButton = sectorDialog.querySelector('[data-sector-dialog-close]');
  const indexElement = sectorDialog.querySelector('[data-sector-dialog-index]');
  const iconUse = sectorDialog.querySelector('[data-sector-dialog-icon]');
  const titleElement = sectorDialog.querySelector('[data-sector-dialog-title]');
  const descriptionElement = sectorDialog.querySelector('[data-sector-dialog-description]');
  const listElement = sectorDialog.querySelector('[data-sector-dialog-list]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lastTrigger;
  let closeTimer;
  let openFrame;

  const closeSectorDialog = () => {
    if (!sectorDialog.open || sectorDialog.classList.contains('is-closing')) return;
    window.cancelAnimationFrame(openFrame);
    sectorDialog.classList.remove('is-preparing');
    sectorDialog.classList.add('is-closing');
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => sectorDialog.close(), reducedMotion.matches ? 0 : 350);
  };

  const setDialogOrigin = (card) => {
    const cardRect = card.getBoundingClientRect();
    const sheetRect = sheet.getBoundingClientRect();
    const originX = cardRect.left + cardRect.width / 2;
    const originY = cardRect.top + cardRect.height / 2;
    const targetX = sheetRect.left + sheetRect.width / 2;
    const targetY = sheetRect.top + sheetRect.height / 2;
    const scaleX = Math.max(.12, Math.min(1, cardRect.width / sheetRect.width));
    const scaleY = Math.max(.12, Math.min(1, cardRect.height / sheetRect.height));

    sectorDialog.style.setProperty('--sector-origin-x', `${originX - targetX}px`);
    sectorDialog.style.setProperty('--sector-origin-y', `${originY - targetY}px`);
    sectorDialog.style.setProperty('--sector-origin-scale-x', scaleX.toFixed(3));
    sectorDialog.style.setProperty('--sector-origin-scale-y', scaleY.toFixed(3));
  };

  const openSectorDialog = (card) => {
    const detail = sectorDetails[card.dataset.sector];
    if (!detail) return;

    lastTrigger = card;
    indexElement.textContent = card.dataset.index;
    titleElement.textContent = card.querySelector('h3').textContent;
    descriptionElement.textContent = detail.description;
    iconUse.setAttribute('href', card.querySelector('use').getAttribute('href'));
    listElement.replaceChildren(...detail.examples.map((example) => {
      const item = document.createElement('li');
      item.textContent = example;
      return item;
    }));

    sectorDialog.classList.remove('is-closing');
    sectorDialog.classList.add('is-preparing');
    document.body.classList.add('sector-dialog-open');
    sectorDialog.showModal();
    openFrame = window.requestAnimationFrame(() => {
      setDialogOrigin(card);
      void sheet.offsetWidth;
      sectorDialog.classList.remove('is-preparing');
      closeButton.focus();
    });
  };

  cards.forEach((card) => card.addEventListener('click', () => openSectorDialog(card)));
  closeButton.addEventListener('click', closeSectorDialog);

  sectorDialog.addEventListener('click', (event) => {
    if (event.target === sectorDialog) closeSectorDialog();
  });

  sectorDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeSectorDialog();
  });

  sectorDialog.addEventListener('close', () => {
    window.clearTimeout(closeTimer);
    window.cancelAnimationFrame(openFrame);
    sectorDialog.classList.remove('is-closing', 'is-preparing');
    document.body.classList.remove('sector-dialog-open');
    sectorDialog.style.removeProperty('--sector-origin-x');
    sectorDialog.style.removeProperty('--sector-origin-y');
    sectorDialog.style.removeProperty('--sector-origin-scale-x');
    sectorDialog.style.removeProperty('--sector-origin-scale-y');
    lastTrigger?.focus();
  });
}
