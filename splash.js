// Keep the opening animation independent of the site's heavier model scripts.
(() => {
  const splash = document.querySelector('.site-splash');
  if (!splash) return;
  const previous = [...document.body.children]
    .filter(element => element !== splash && !['SCRIPT', 'STYLE'].includes(element.tagName))
    .map(element => [element, element.inert]);
  previous.forEach(([element]) => { element.inert = true; });
  const preventScroll = event => event.preventDefault();
  splash.addEventListener('wheel', preventScroll, {passive:false});
  splash.addEventListener('touchmove', preventScroll, {passive:false});
  let timer;
  const finish = () => {
    clearTimeout(timer);
    previous.forEach(([element, inert]) => { element.inert = inert; });
    splash.remove();
  };
  splash.addEventListener('animationend', event => {
    if (event.target === splash) finish();
  });
  // Never leave the page blocked if an animation event is interrupted.
  timer = setTimeout(finish, matchMedia('(prefers-reduced-motion: reduce)').matches ? 350 : 4000);
  addEventListener('pageshow', event => { if (event.persisted) finish(); });
})();
