const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = reduceMotion ? '0ms' : `${Math.min(index % 3, 2) * 90}ms`;
  revealObserver.observe(element);
});

const numberObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const end = Number(element.dataset.count);
    if (reduceMotion) {
      element.textContent = end.toLocaleString('en-US').replaceAll(',', ' ');
    } else {
      const start = performance.now();
      const duration = 1700;
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        element.textContent = Math.round(end * eased).toLocaleString('en-US').replaceAll(',', ' ');
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    numberObserver.unobserve(element);
  });
}, { threshold: 0.45 });

document.querySelectorAll('[data-count]').forEach((element) => numberObserver.observe(element));

const map = document.querySelector('.map-wrap');
if (map) {
  const mapObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      map.classList.add('map-visible');
      mapObserver.disconnect();
    }
  }, { threshold: 0.2 });
  mapObserver.observe(map);
}

document.querySelectorAll('[data-before-after]').forEach((comparison) => {
  const slider = comparison.querySelector('input[type="range"]');
  const updateComparison = () => comparison.style.setProperty('--reveal', `${slider.value}%`);
  slider.addEventListener('input', updateComparison);
  updateComparison();
});

const projectComparison = document.querySelector('[data-before-after]');
if (projectComparison) {
  const projects = [
    {
      before: 'Images/bathroom-before.jpg',
      after: 'Images/bathroom-after.jpg',
      beforeAlt: 'Bathroom before renovation',
      afterAlt: 'Bathroom after PlumbTech renovation'
    },
    {
      before: 'Images/ceiling-before.jpg',
      after: 'Images/ceiling-after.jpg',
      beforeAlt: 'Water-damaged ceiling before repair',
      afterAlt: 'Ceiling after PlumbTech repair and finishing'
    }
  ];
  const beforeImage = projectComparison.querySelector('.comparison-before');
  const afterImage = projectComparison.querySelector('.comparison-after img');
  const range = projectComparison.querySelector('input[type="range"]');
  const counter = document.querySelector('[data-comparison-count]');
  const previousProject = document.querySelector('[data-comparison-prev]');
  const nextProject = document.querySelector('[data-comparison-next]');
  let projectIndex = 0;
  let changingProject = false;

  const showProject = async (direction) => {
    if (changingProject) return;
    changingProject = true;
    const outgoing = projectComparison.animate([
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: `translateX(${direction * -36}px)` }
    ], { duration: 220, easing: 'ease-in', fill: 'forwards' });
    await outgoing.finished;

    projectIndex = (projectIndex + direction + projects.length) % projects.length;
    const project = projects[projectIndex];
    beforeImage.src = project.before;
    beforeImage.alt = project.beforeAlt;
    afterImage.src = project.after;
    afterImage.alt = project.afterAlt;
    range.value = 50;
    projectComparison.style.setProperty('--reveal', '50%');
    counter.textContent = `${projectIndex + 1} / ${projects.length}`;
    range.setAttribute('aria-label', `Reveal ${project.beforeAlt.toLowerCase()} and completed result`);
    outgoing.cancel();

    const incoming = projectComparison.animate([
      { opacity: 0, transform: `translateX(${direction * 36}px)` },
      { opacity: 1, transform: 'translateX(0)' }
    ], { duration: 360, easing: 'cubic-bezier(.22,.8,.2,1)' });
    await incoming.finished;
    changingProject = false;
  };

  previousProject.addEventListener('click', () => showProject(-1));
  nextProject.addEventListener('click', () => showProject(1));
}

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
menuButton.addEventListener('click', () => {
  const open = header.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.main-nav a').forEach((link) => link.addEventListener('click', () => {
  header.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const cookie = document.querySelector('[data-cookie]');
cookie.querySelector('button').addEventListener('click', () => {
  cookie.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }], { duration: 350, easing: 'ease', fill: 'forwards' }).finished.then(() => cookie.remove());
});

if (!reduceMotion) {
  const heroMan = document.querySelector('.hero-man');
  const heroMark = document.querySelector('.hero-mark');
  window.addEventListener('scroll', () => {
    const y = Math.min(window.scrollY, window.innerHeight);
    heroMan.style.transform = `translate3d(0, ${y * 0.08}px, 0)`;
    heroMark.style.transform = `translate3d(0, ${y * 0.04}px, 0)`;
  }, { passive: true });
}

const newsTrack = document.querySelector('.news-track');
if (newsTrack) {
  const previous = document.querySelector('.press-arrows .prev');
  const next = document.querySelector('.press-arrows .next');
  const cards = [...newsTrack.querySelectorAll('.news-card')];
  let newsIndex = 0;

  const updateNews = () => {
    const visibleCards = cards.filter((card) => !card.hidden);
    if (!visibleCards.length) return;
    const gap = Number.parseFloat(getComputedStyle(newsTrack).gap) || 0;
    const cardWidth = visibleCards[0].getBoundingClientRect().width;
    const step = cardWidth + gap;
    const viewport = newsTrack.parentElement.getBoundingClientRect().width;
    const contentWidth = visibleCards.length * cardWidth + Math.max(0, visibleCards.length - 1) * gap;
    const maxIndex = Math.max(0, Math.ceil((contentWidth - viewport) / step));
    newsIndex = Math.min(newsIndex, maxIndex);
    newsTrack.style.transform = `translate3d(${-newsIndex * step}px,0,0)`;
    previous.disabled = newsIndex === 0;
    next.disabled = newsIndex === maxIndex;
  };

  previous.addEventListener('click', () => {
    newsIndex = Math.max(0, newsIndex - 1);
    updateNews();
  });
  next.addEventListener('click', () => {
    newsIndex += 1;
    updateNews();
  });
  const filterServices = (tab, animate = true) => {
    document.querySelector('.tabs button.active')?.classList.remove('active');
    tab.classList.add('active');
    const category = tab.dataset.serviceFilter;
    cards.forEach((card) => {
      card.hidden = card.dataset.serviceCategory !== category;
      if (!card.hidden && animate) {
        card.animate([
          { opacity: 0, transform: 'translateY(22px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 420, easing: 'cubic-bezier(.22,.8,.2,1)' });
      }
    });
    newsIndex = 0;
    newsTrack.style.transform = 'translate3d(0,0,0)';
    requestAnimationFrame(updateNews);
  };
  document.querySelectorAll('[data-service-filter]').forEach((tab) => {
    tab.addEventListener('click', () => filterServices(tab));
  });
  addEventListener('resize', updateNews, { passive: true });
  filterServices(document.querySelector('[data-service-filter].active'), false);
}
