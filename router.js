(() => {
  const routes = {
    '/': 'top',
    '/about': 'about',
    '/services': 'press',
    '/our-work': 'responsibility',
    '/contacts': 'contacts',
    '/how-we-work': 'bathroom-model',
  };
  const paths = Object.fromEntries(Object.entries(routes).map(([path, id]) => [id, path]));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const normalize = (path) => path.replace(/\/+$/, '') || '/';

  // GitHub Pages sends direct route requests through 404.html to this entry point.
  const params = new URLSearchParams(location.search);
  const requestedRoute = params.get('_route');
  if (requestedRoute && routes[normalize(requestedRoute)]) {
    params.delete('_route');
    const query = params.toString();
    history.replaceState(null, '', normalize(requestedRoute) + (query ? `?${query}` : ''));
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const path = paths[link.getAttribute('href').slice(1)];
    if (!path) return;
    link.setAttribute('href', path);
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (location.pathname !== path || location.hash) history.pushState(null, '', path + location.search);
      navigate(true);
    });
  });

  function navigate(animate) {
    const target = document.getElementById(routes[normalize(location.pathname)]);
    if (!target) return;
    target.scrollIntoView({ behavior: animate && !reducedMotion ? 'smooth' : 'instant', block: 'start' });
    if (animate) {
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
      target.focus({ preventScroll: true });
    }
  }

  // Keep old bookmarked fragment links working with the new URLs.
  const legacyPath = paths[location.hash.slice(1)];
  if (legacyPath) history.replaceState(null, '', legacyPath + location.search);
  history.scrollRestoration = 'manual';
  window.addEventListener('popstate', () => navigate(false));
  window.addEventListener('load', () => navigate(false), { once: true });
})();
