import * as THREE from './vendor/three/three.module.js';
import { createBathroom } from './bathroom-geometry.js?v=2';

const host = document.querySelector('[data-bathroom-viewer]');
try {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  const model = createBathroom();
  scene.add(model);
  // Center the actual geometry so cursor tracking rotates about the whole bathroom.
  const bounds=new THREE.Box3().setFromObject(model);
  const center=bounds.getCenter(new THREE.Vector3());
  model.children.forEach(child=>child.position.sub(center));
  const radius=bounds.getSize(new THREE.Vector3()).length()/2;
  const zoom=1.3;
  const initial=new THREE.Quaternion().setFromEuler(new THREE.Euler(.27,-.32,0));
  model.quaternion.copy(initial);
  function render(){renderer.render(scene,camera);}
  function resize(){
    const {width,height}=host.getBoundingClientRect();
    renderer.setSize(width,height,false);camera.aspect=width/height;
    const halfFov=Math.min(THREE.MathUtils.degToRad(18),Math.atan(Math.tan(THREE.MathUtils.degToRad(18))*camera.aspect));
    camera.position.set(0,0,radius/Math.sin(halfFov)*1.05/zoom);
    camera.lookAt(0,0,0);camera.updateProjectionMatrix();render();
  }
  new ResizeObserver(resize).observe(host);
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const rest = { x: .27, y: -.32 };
  const target = { ...rest };
  const current = { ...rest };
  let frame = null;
  function animate() {
    current.x += (target.x - current.x) * .12;
    current.y += (target.y - current.y) * .12;
    model.rotation.set(current.x, current.y, 0);
    render();
    if (Math.abs(target.x-current.x) + Math.abs(target.y-current.y) > .001) {
      frame = requestAnimationFrame(animate);
    } else {
      frame = null;
    }
  }
  function update() { if (frame === null) frame = requestAnimationFrame(animate); }
  host.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || motionPreference.matches) return;
    const rect = host.getBoundingClientRect();
    const x = THREE.MathUtils.clamp((event.clientX-rect.left)/rect.width, 0, 1);
    const y = THREE.MathUtils.clamp((event.clientY-rect.top)/rect.height, 0, 1);
    target.y = rest.y + (x-.5)*Math.PI*2;
    target.x = rest.x + (y-.5)*Math.PI;
    update();
  });
  host.addEventListener('pointerleave', () => { Object.assign(target, rest); update(); });
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) {
      cancelAnimationFrame(frame); frame = null;
      Object.assign(target, rest); Object.assign(current, rest);
      model.quaternion.copy(initial); render();
    }
  });
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();host.classList.remove('ready');host.querySelector('[role="status"]').textContent='3D view paused. Reload to try again.';});
  host.classList.add('ready');resize();
} catch(error){
  host.querySelector('[role="status"]').textContent='Showing the bathroom drawing. Interactive 3D is unavailable in this browser.';
  console.error('Bathroom viewer could not start',error);
}
