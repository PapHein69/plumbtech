// Scroll-linked rotation for tablet/touch screens; cursor tracking stays on desktop.
export function bindScrollRotation(host, setRotation, reset) {
  const compact = matchMedia('(max-width: 1024px), (hover: none)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  function update() {
    queued = false;
    if (!compact.matches || reduced.matches) return;
    const r = host.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const progress = (innerHeight-r.top)/(innerHeight+r.height);
    setRotation(Math.sin((progress-.5)*Math.PI)*.85);
  }
  function schedule() { if (!queued) { queued=true; requestAnimationFrame(update); } }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  compact.addEventListener('change',()=>{reset();schedule();});
  reduced.addEventListener('change',()=>{reset();schedule();});
  schedule();
  return () => compact.matches || reduced.matches;
}
