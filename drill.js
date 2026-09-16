(async () => {
  const host = document.querySelector('[data-drill-model]');
  if (!host) return;

  try {
    const THREE = await import('./vendor/three/three.module.js');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(29, 1, 0.1, 100);
    camera.position.set(8.5, 4.8, 23);
    camera.lookAt(0, 2.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 0);
    host.appendChild(renderer.domElement);

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x6f7e88, transparent: true, opacity: 0.82 });
    const surfaceMaterial = new THREE.MeshPhongMaterial({
      color: 0xaab5bc,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      shininess: 55,
      depthWrite: false
    });
    const plumbing = new THREE.Group();

    const edges = (geometry, position, rotation = [0, 0, 0], scale = [1, 1, 1]) => {
      const object = new THREE.Group();
      const surface = new THREE.Mesh(geometry, surfaceMaterial);
      const outline = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 18), lineMaterial);
      object.add(surface, outline);
      object.position.set(...position);
      object.rotation.set(...rotation);
      object.scale.set(...scale);
      plumbing.add(object);
      return object;
    };

    const cylinder = (radius, length, position, rotation = [0, 0, 0]) =>
      edges(new THREE.CylinderGeometry(radius, radius, length, 18, 2, true), position, rotation);

    const tube = (points, radius = 0.18) => {
      const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
      return edges(new THREE.TubeGeometry(curve, 48, radius, 10, false), [0, 0, 0]);
    };

    // Basin and rim.
    edges(new THREE.SphereGeometry(2.8, 32, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), [0, 4.5, 0], [0, 0, Math.PI], [1.65, 0.72, 1]);
    edges(new THREE.TorusGeometry(3.05, 0.12, 8, 36), [0, 4.65, 0], [Math.PI / 2, 0, 0], [1.42, 1, 0.78]);

    // Faucet body, spout and handles.
    cylinder(0.2, 1.1, [0, 5.8, -0.25]);
    tube([[0, 6.25, -0.25], [0, 6.8, -0.2], [0.7, 6.85, 0], [0.9, 6.35, 0.25]], 0.16);
    cylinder(0.23, 0.45, [-0.75, 5.65, -0.2]);
    cylinder(0.23, 0.45, [0.75, 5.65, -0.2]);
    edges(new THREE.BoxGeometry(0.8, 0.12, 0.18), [-0.75, 5.9, -0.2], [0, 0.25, 0]);
    edges(new THREE.BoxGeometry(0.8, 0.12, 0.18), [0.75, 5.9, -0.2], [0, -0.25, 0]);

    // Drain tailpiece and P-trap.
    cylinder(0.24, 1.85, [0.35, 2.95, 0]);
    cylinder(0.34, 0.42, [0.35, 3.72, 0]);
    tube([[0.35, 2.05, 0], [0.35, 1.15, 0], [0.65, 0.55, 0], [1.25, 0.55, 0], [1.55, 1.05, 0], [1.55, 1.5, 0]], 0.26);
    tube([[1.55, 1.5, 0], [2.25, 1.5, 0], [2.9, 1.5, 0]], 0.24);
    cylinder(0.34, 0.42, [1.55, 1.36, 0]);

    // Hot and cold water supply lines with shutoff valves.
    [-1.35, -0.45].forEach((x, index) => {
      tube([[x, -1.8, -0.25], [x, 0.3, -0.25], [x + (index ? 0.22 : -0.12), 2.1, -0.15], [index ? 0.75 : -0.75, 4.85, -0.1]], 0.115);
      cylinder(0.2, 0.55, [x, 0.2, -0.25]);
      cylinder(0.08, 0.65, [x, 0.35, -0.25], [0, 0, Math.PI / 2]);
      edges(new THREE.BoxGeometry(0.62, 0.09, 0.18), [x, 0.35, -0.25], [0, 0, index ? 0.35 : -0.35]);
    });

    // Main lines and simple wall framing, matching the reference composition.
    tube([[-3.6, -1.75, -0.25], [-1.35, -1.75, -0.25], [0.5, -1.75, -0.25], [3.4, -1.75, -0.25]], 0.14);
    tube([[-3.1, -2.25, 0.45], [-0.45, -2.25, 0.45], [2.9, -2.25, 0.45]], 0.14);
    [-3.1, 3.1].forEach((x) => edges(new THREE.BoxGeometry(0.12, 8.2, 0.12), [x, 1.8, 0.9]));
    [-1.8, 1.8].forEach((x) => edges(new THREE.BoxGeometry(0.1, 7.2, 0.1), [x, 1.3, 1.15]));

    plumbing.position.y = 0.4;
    plumbing.rotation.y = -0.46;
    scene.add(plumbing);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x64727b, 1.8));
    const depthLight = new THREE.DirectionalLight(0xffffff, 1.3);
    depthLight.position.set(7, 10, 12);
    scene.add(depthLight);
    host.classList.add('loaded');

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(host);
    resize();

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let targetRotationX = 0;
    let targetRotationY = -0.46;

    const section = host.closest('.drilled');
    const rotateTowardPointer = (event) => {
      const rect = host.getBoundingClientRect();
      if (event.clientY < rect.top || event.clientY > rect.bottom) return;
      const pointerX = THREE.MathUtils.clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const pointerY = THREE.MathUtils.clamp((event.clientY - rect.top) / rect.height, 0, 1);

      targetRotationY = THREE.MathUtils.lerp(-1.05, 1.05, pointerX);
      targetRotationX = THREE.MathUtils.lerp(0.28, -0.28, pointerY);
    };

    const returnToRest = () => {
      targetRotationX = 0;
      targetRotationY = -0.46;
    };

    section.addEventListener('pointermove', rotateTowardPointer, { passive: true });
    section.addEventListener('pointerleave', returnToRest, { passive: true });

    const render = () => {
      const easing = 0.075;
      plumbing.rotation.y += (targetRotationY - plumbing.rotation.y) * easing;
      plumbing.rotation.x += (targetRotationX - plumbing.rotation.x) * easing;
      plumbing.position.y = reduceMotion ? 0.4 : 0.4 + Math.sin(performance.now() * 0.00055) * 0.08;
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };
    render();
  } catch (error) {
    host.querySelector('.model-loader').textContent = 'Illustration unavailable';
    console.error('Plumbing illustration could not start', error);
  }
})();
