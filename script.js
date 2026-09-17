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
  const viewport = newsTrack.parentElement;
  const previous = document.querySelector('.press-arrows .prev');
  const next = document.querySelector('.press-arrows .next');
  const cards = [...newsTrack.querySelectorAll('.news-card')];
  const mobile = matchMedia('(max-width: 1024px), (hover: none)');
  let lastY = scrollY;
  let manualUntil = 0;
  let pending = false;
  const updateButtons = () => {
    previous.disabled = viewport.scrollLeft <= 1;
    next.disabled = viewport.scrollLeft >= viewport.scrollWidth-viewport.clientWidth-1;
  };
  const move = direction => {
    manualUntil = performance.now()+2500;
    const card = cards.find(c => !c.hidden);
    const step = card.getBoundingClientRect().width + (parseFloat(getComputedStyle(newsTrack).gap)||0);
    viewport.scrollBy({left:direction*step,behavior:reduceMotion?'instant':'smooth'});
  };
  previous.addEventListener('click',()=>move(-1));
  next.addEventListener('click',()=>move(1));
  viewport.addEventListener('scroll',updateButtons,{passive:true});
  viewport.addEventListener('pointerdown',()=>{manualUntil=Infinity;},{passive:true});
  const release = () => {manualUntil=performance.now()+2500;};
  viewport.addEventListener('pointerup',release,{passive:true});
  viewport.addEventListener('pointercancel',release,{passive:true});
  const filterServices = tab => {
    document.querySelector('.tabs button.active')?.classList.remove('active');
    tab.classList.add('active');
    cards.forEach(card=>{card.hidden=card.dataset.serviceCategory!==tab.dataset.serviceFilter;});
    viewport.scrollLeft=0;
    manualUntil=performance.now()+1200;
    requestAnimationFrame(updateButtons);
  };
  document.querySelectorAll('[data-service-filter]').forEach(tab=>tab.addEventListener('click',()=>filterServices(tab)));
  addEventListener('scroll',()=>{
    if(pending)return;
    pending=true;
    requestAnimationFrame(()=>{
      const delta=scrollY-lastY;lastY=scrollY;pending=false;
      const r=viewport.getBoundingClientRect();
      if(mobile.matches&&!reduceMotion&&performance.now()>manualUntil&&r.top<innerHeight&&r.bottom>0){
        viewport.scrollLeft+=delta*.35;
      }
    });
  },{passive:true});
  new ResizeObserver(updateButtons).observe(viewport);
  filterServices(document.querySelector('[data-service-filter].active'));
}
