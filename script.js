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

// Independent translate properties preserve the existing entrance animations.
(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cursor = matchMedia('(min-width: 1025px) and (hover: hover) and (pointer: fine)');
  let x=0, y=0, targetX=0, targetY=0, scroll=0, targetScroll=0, frame=0;
  function draw() {
    frame=0;
    x+=(targetX-x)*.09; y+=(targetY-y)*.09; scroll+=(targetScroll-scroll)*.1;
    hero.style.setProperty('--hero-x', `${x}px`);
    hero.style.setProperty('--hero-y', `${y}px`);
    hero.style.setProperty('--hero-scroll', `${scroll}px`);
    if(Math.abs(x-targetX)+Math.abs(y-targetY)+Math.abs(scroll-targetScroll)>.1) wake();
  }
  function wake(){if(!frame) frame=requestAnimationFrame(draw);}
  function updateScroll(){
    const r=hero.getBoundingClientRect();
    targetScroll=reduced.matches?0:Math.max(0,Math.min(-r.top,r.height));
    wake();
  }
  const leave=()=>{targetX=targetY=0;wake();};
  hero.addEventListener('pointermove',event=>{
    if(reduced.matches||!cursor.matches||event.pointerType==='touch')return;
    const r=hero.getBoundingClientRect();
    targetX=((event.clientX-r.left)/r.width-.5)*24;
    targetY=((event.clientY-r.top)/r.height-.5)*16;
    wake();
  });
  hero.addEventListener('pointerleave',leave);
  hero.addEventListener('pointercancel',leave);
  addEventListener('blur',leave);
  addEventListener('scroll',updateScroll,{passive:true});
  addEventListener('resize',updateScroll,{passive:true});
  cursor.addEventListener('change',leave);
  reduced.addEventListener('change',()=>{leave();updateScroll();});
  updateScroll();
})();

// A soft cursor-following light gives the footer depth without moving controls.
(() => {
  const footer = document.querySelector('[data-interactive-footer]');
  if (!footer) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let x=72, y=18, targetX=x, targetY=y, frame=0;
  const draw = () => {
    frame=0;x+=(targetX-x)*.1;y+=(targetY-y)*.1;
    footer.style.setProperty('--footer-x',`${x}%`);footer.style.setProperty('--footer-y',`${y}%`);
    if(Math.abs(targetX-x)+Math.abs(targetY-y)>.08) frame=requestAnimationFrame(draw);
  };
  const wake=()=>{if(!frame)frame=requestAnimationFrame(draw);};
  footer.addEventListener('pointermove',event=>{
    if(reduced.matches||!finePointer.matches||event.pointerType==='touch')return;
    const box=footer.getBoundingClientRect();
    targetX=(event.clientX-box.left)/box.width*100;targetY=(event.clientY-box.top)/box.height*100;wake();
  });
  footer.addEventListener('pointerleave',()=>{targetX=72;targetY=18;wake();});
})();

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

// Let nearby dots behave like a softly disturbed liquid surface.
(() => {
  const host = document.querySelector('.map-dotted');
  if (!host) return;
  const area = host.parentElement;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const silhouette = new Image();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  let dots = [], ripples = [], width = 0, height = 0, frame = 0;
  let pointer = null, pointerVx = 0, pointerVy = 0, lastPointerMove = 0, lastRipple = 0;
  let scrollEnergy = 0, scrollDirection = 0, lastScrollY = scrollY, scrollQueued = false, lastScrollRipple = 0;
  const rippleLife = 2300;
  function draw(now) {
    frame = 0;
    ctx.clearRect(0, 0, width, height);
    ripples = ripples.filter(ripple => now-ripple.born < rippleLife);
    const idleFor = now-lastPointerMove;
    const cursorEnergy = pointer && !reduced.matches ? Math.max(0,Math.min(1,1-(idleFor-70)/950)) : 0;
    pointerVx *= .94;
    pointerVy *= .94;
    scrollEnergy *= .945;
    if(scrollEnergy < .001) scrollEnergy = 0;
    let moving = ripples.length > 0 || cursorEnergy > .001 || scrollEnergy > 0;
    for (const dot of dots) {
      const dx = pointer ? dot.x - pointer.x : 0;
      const dy = pointer ? dot.y - pointer.y : 0;
      const distance = pointer ? Math.hypot(dx, dy) : Infinity;
      const influence = Math.max(0, 1 - distance / 150);
      const localForce = influence * influence * cursorEnergy;
      const directionX = distance > 0 ? dx/distance : 0;
      const directionY = distance > 0 ? dy/distance : 0;
      let forceX = directionX * localForce * .48 + pointerVx * influence * .018;
      let forceY = directionY * localForce * .48 + pointerVy * influence * .018;
      const eddy = localForce * Math.sin(now*.0022+dot.phase) * .085;
      forceX += -directionY * eddy;
      forceY += directionX * eddy;
      if(scrollEnergy) {
        const flow = Math.sin(dot.y*.031+dot.x*.012+now*.005+dot.phase*.16);
        const crossFlow = Math.cos(dot.y*.019-dot.x*.014+now*.0042);
        forceX += flow*scrollEnergy*.043;
        forceY += (crossFlow*.027+scrollDirection*.014)*scrollEnergy;
      }
      let wave = 0;
      if (!reduced.matches) for (const ripple of ripples) {
        const age = (now-ripple.born)/rippleLife;
        const easedAge = 1-Math.pow(1-age,1.7);
        const radius = easedAge * Math.hypot(width,height) * .92;
        const ringDistance = Math.abs(Math.hypot(dot.x-ripple.x,dot.y-ripple.y)-radius);
        const band = Math.exp(-(ringDistance*ringDistance)/(2*42*42)) * Math.sin(Math.PI*age) * ripple.strength;
        if (band < .002) continue;
        const rdx = dot.x-ripple.x, rdy = dot.y-ripple.y;
        const rlen = Math.hypot(rdx,rdy) || 1;
        forceX += rdx/rlen * band * .12;
        forceY += rdy/rlen * band * .12;
        wave = Math.max(wave,band);
      }
      dot.vx += forceX-dot.ox*.014;
      dot.vy += forceY-dot.oy*.014;
      dot.vx *= .925;
      dot.vy *= .925;
      dot.ox += dot.vx;
      dot.oy += dot.vy;
      const red = Math.min(1, localForce*1.65 + wave*.2);
      const alpha = 1-wave*.16;
      const scale = 1+localForce*.2+wave*.1;
      dot.red += (red-dot.red)*.09;
      dot.alpha += (alpha-dot.alpha)*.07;
      dot.scale += (scale-dot.scale)*.08;
      moving ||= Math.abs(dot.vx)+Math.abs(dot.vy)+Math.abs(dot.ox)*.014+Math.abs(dot.oy)*.014+Math.abs(red-dot.red)+Math.abs(alpha-dot.alpha)+Math.abs(scale-dot.scale) > .008;
      const c = dot.red;
      ctx.fillStyle = `rgb(${195+(173-195)*c},${205+(30-205)*c},${211+(46-211)*c})`;
      ctx.globalAlpha = dot.alpha;
      ctx.beginPath();
      ctx.arc(dot.x+dot.ox, dot.y+dot.oy, (width <= 360 ? 1 : 1.6)*dot.scale, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (moving) frame = requestAnimationFrame(draw);
  }
  function wake() { if (!frame) frame = requestAnimationFrame(draw); }
  function resize() {
    width = host.clientWidth; height = host.clientHeight;
    if (!width || !height) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const sample = document.createElement('canvas');
    sample.width = Math.ceil(width); sample.height = Math.ceil(height);
    const sampleCtx = sample.getContext('2d', {willReadFrequently:true});
    sampleCtx.drawImage(silhouette,0,0,sample.width,sample.height);
    const pixels = sampleCtx.getImageData(0,0,sample.width,sample.height).data;
    const spacing = width <= 360 ? 5 : 8;
    dots = [];
    for(let y=spacing/2;y<height;y+=spacing) for(let x=spacing/2;x<width;x+=spacing) {
      if(pixels[(Math.floor(y)*sample.width+Math.floor(x))*4+3]>128)
        dots.push({x,y,ox:0,oy:0,vx:0,vy:0,red:0,alpha:1,scale:1,phase:Math.sin(x*12.9898+y*78.233)*Math.PI*2});
    }
    ripples = [];
    pointer = null;
    scrollEnergy = 0;
    wake();
  }
  area.addEventListener('pointermove', event => {
    if(event.pointerType === 'touch') return;
    const box = host.getBoundingClientRect();
    const next = {x:event.clientX-box.left,y:event.clientY-box.top};
    const moved = pointer ? Math.hypot(next.x-pointer.x,next.y-pointer.y) : Infinity;
    if(pointer) {
      pointerVx += (next.x-pointer.x-pointerVx)*.3;
      pointerVy += (next.y-pointer.y-pointerVy)*.3;
    }
    pointer = next;
    const now = performance.now();
    lastPointerMove = now;
    if(!reduced.matches && moved > 7 && now-lastRipple > 115) {
      ripples.push({x:pointer.x,y:pointer.y,born:now,strength:Math.min(.8,.3+moved/70)});
      if(ripples.length > 6) ripples.shift();
      lastRipple = now;
    }
    wake();
  });
  const leave = () => {pointer=null;pointerVx=pointerVy=0;wake();};
  const handleMobileScroll = () => {
    scrollQueued = false;
    const currentY = scrollY;
    const delta = currentY-lastScrollY;
    lastScrollY = currentY;
    if(reduced.matches || !mobile.matches || !delta) return;
    const box = host.getBoundingClientRect();
    if(box.bottom < 0 || box.top > innerHeight) return;
    const strength = Math.min(1,Math.abs(delta)/36);
    scrollDirection = Math.sign(delta);
    scrollEnergy = Math.min(1,Math.max(scrollEnergy,.18+strength*.72));
    const now = performance.now();
    if(now-lastScrollRipple > 360) {
      ripples.push({x:width*(.5+scrollDirection*.1),y:height*.52,born:now,strength:.12+strength*.2});
      if(ripples.length > 6) ripples.shift();
      lastScrollRipple = now;
    }
    wake();
  };
  const queueMobileScroll = () => {
    if(scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(handleMobileScroll);
  };
  area.addEventListener('pointerleave', leave);
  area.addEventListener('pointercancel', leave);
  window.addEventListener('blur', leave);
  window.addEventListener('scroll', queueMobileScroll, {passive:true});
  reduced.addEventListener('change', () => {scrollEnergy=0;leave();});
  mobile.addEventListener('change', () => {scrollEnergy=0;lastScrollY=scrollY;wake();});
  silhouette.onload = () => {
    host.append(canvas);
    host.classList.add('map-dotted-interactive');
    resize();
    new ResizeObserver(resize).observe(host);
  };
  silhouette.src = 'Images/map-south-africa-transparent.png';
})();

document.querySelectorAll('.map-service-slideshow').forEach((slideshow, index) => {
  const slides = [...slideshow.querySelectorAll('img')];
  const caption = slideshow.querySelector('[data-map-caption]');
  const button = slideshow.querySelector('[data-map-pause]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, timer = null, visible = false, paused = reduced.matches;
  const sync = () => {
    clearInterval(timer);
    button.textContent = paused ? 'Play' : 'Pause';
    button.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} service slideshow`);
    if (paused || !visible || document.hidden) return;
    timer = setInterval(() => {
      const next = (current + 1) % slides.length;
      if (!slides[next].complete || !slides[next].naturalWidth) return;
      slides[current].classList.remove('is-active');
      slides[current].setAttribute('aria-hidden', 'true');
      current = next;
      slides[current].classList.add('is-active');
      slides[current].removeAttribute('aria-hidden');
      caption.textContent = slides[current].alt;
    }, 5200 + index * 900);
  };
  button.addEventListener('click', () => { paused = !paused; sync(); });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => { paused = reduced.matches; sync(); });
  new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; sync();}).observe(slideshow);
  sync();
});
