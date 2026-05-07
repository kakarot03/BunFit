(function initThreeScene() {
  if (typeof THREE === 'undefined') return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile       = window.innerWidth < 768;

  const canvas   = document.getElementById('three-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  // Lighting
  scene.add(new THREE.AmbientLight(0xFFFFFF, 0.5));
  const dirLight = new THREE.DirectionalLight(0xFFE0B2, 1.4);
  dirLight.position.set(5, 8, 5);
  scene.add(dirLight);
  const pointLight = new THREE.PointLight(0xC9873A, 0.8);
  pointLight.position.set(0, 3, 3);
  scene.add(pointLight);
  scene.add(new THREE.HemisphereLight(0xFFF8F0, 0x3B1F0A, 0.4));

  // Geometry quality — reduce on mobile
  const SEG  = isMobile ? 16 : 32;
  const SEG2 = isMobile ? 8  : 16;

  // Shared materials
  const mat = {
    goldenDome:   new THREE.MeshPhongMaterial({ color: 0xC9873A, specular: 0xFFD580, shininess: 90 }),
    goldenBase:   new THREE.MeshPhongMaterial({ color: 0x8B4513, shininess: 40 }),
    butter:       new THREE.MeshPhongMaterial({ color: 0xF5F0E8, shininess: 20 }),
    jam:          new THREE.MeshPhongMaterial({ color: 0xC0392B, shininess: 30 }),
    charcoal:     new THREE.MeshPhongMaterial({ color: 0x1A1A1A, specular: 0x333333, shininess: 15 }),
    whiteChoco:   new THREE.MeshPhongMaterial({ color: 0xFFFFFF, specular: 0xFFFFFF, shininess: 120 }),
    darkChoco:    new THREE.MeshPhongMaterial({ color: 0x3D1A00, specular: 0x5C2A0A, shininess: 100 }),
    sesame:       new THREE.MeshPhongMaterial({ color: 0xD4A85C }),
    dripOreo:     new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 80 }),
    dripChoco:    new THREE.MeshPhongMaterial({ color: 0x5C2A0A, shininess: 60 }),
    boost:        new THREE.MeshPhongMaterial({ color: 0x6B3A1F, shininess: 30 }),
    tea:          new THREE.MeshPhongMaterial({ color: 0xC47A2A, shininess: 50 }),
    teaLiquid:    new THREE.MeshPhongMaterial({ color: 0x8B3A0A, shininess: 80 }),
  };

  // Build a bun group: dome + fill band + base
  function makeBun(domeMat, fillMat, baseMat, addSeeds) {
    const group = new THREE.Group();

    const dome = new THREE.Mesh(new THREE.SphereGeometry(1, SEG, SEG2, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
    group.add(dome);

    const fill = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.95, 0.15, SEG), fillMat);
    fill.position.y = 0;
    group.add(fill);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.85, 0.6, SEG), baseMat);
    base.position.y = -0.375;
    group.add(base);

    if (addSeeds) {
      for (let i = 0; i < 12; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.random() * Math.PI * 0.45;
        const r     = 1.05;
        const seed  = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), mat.sesame);
        seed.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
        group.add(seed);
      }
    }

    return group;
  }

  // Hang drip cylinders from the fill band underside
  function addDrips(group, dripMat, count) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const drip  = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.02, 0.22, 6), dripMat);
      drip.position.set(Math.cos(angle) * 0.92, -0.12, Math.sin(angle) * 0.92);
      drip.userData.swayOffset = i;
      group.add(drip);
    }
  }

  // Build a simple tea cup
  function makeTea() {
    const group = new THREE.Group();
    group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 0.8, SEG), mat.tea));
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.05, SEG), mat.teaLiquid);
    liquid.position.y = 0.38;
    group.add(liquid);
    return group;
  }

  // Bun factory functions (index corresponds to bunConfigs order)
  const bunFactories = [
    () => makeBun(mat.goldenDome, mat.butter,     mat.goldenBase, false),
    () => makeBun(mat.goldenDome, mat.jam,         mat.goldenBase, false),
    () => { const g = makeBun(mat.charcoal,    mat.whiteChoco,  mat.charcoal.clone(), true);  addDrips(g, mat.dripOreo,  3); return g; },
    () => { const g = makeBun(mat.charcoal,    mat.darkChoco,   mat.charcoal.clone(), true);  addDrips(g, mat.dripChoco, 4); return g; },
    () => makeBun(mat.goldenDome, mat.boost,      mat.goldenBase, false),
    makeTea,
    () => makeBun(mat.goldenDome, mat.butter,     mat.goldenBase, false),
  ];

  // Positions: [x, y, z, scale, phase]
  const configs = isMobile
    ? [
        { x: -2.8, y:  0.4, z: -1.0, scale: 0.90, phase: 0.0 },
        { x:  2.6, y: -0.2, z: -0.5, scale: 0.85, phase: 1.2 },
        { x:  0.0, y:  1.2, z: -2.0, scale: 0.75, phase: 2.4 },
        { x: -1.2, y: -1.4, z:  0.5, scale: 0.70, phase: 3.6 },
      ]
    : [
        { x: -4.0, y:  0.8, z: -1.5, scale: 0.95, phase: 0.0 },
        { x: -1.8, y: -1.0, z:  0.5, scale: 0.85, phase: 1.1 },
        { x:  1.2, y:  1.4, z: -1.0, scale: 1.00, phase: 2.2 },
        { x:  3.8, y:  0.2, z: -0.5, scale: 0.90, phase: 3.3 },
        { x:  0.2, y: -1.6, z: -2.0, scale: 0.80, phase: 4.4 },
        { x: -3.0, y:  1.8, z: -3.0, scale: 0.50, phase: 5.5 },
        { x:  2.5, y: -2.2, z: -2.5, scale: 0.50, phase: 0.7 },
      ];

  const bunGroups = configs.map((cfg, i) => {
    const group = bunFactories[i % bunFactories.length]();
    group.position.set(cfg.x, cfg.y, cfg.z);
    group.scale.setScalar(cfg.scale);
    group.userData = { baseY: cfg.y, phase: cfg.phase, baseScale: cfg.scale };
    scene.add(group);
    return group;
  });

  // Mouse tracking for scene rotation and raycasting
  let mouseNormX = 0, mouseNormY = 0;
  let targetRotX = 0, targetRotY = 0;
  const raycaster = new THREE.Raycaster();
  const mouse     = new THREE.Vector2();

  window.addEventListener('mousemove', (e) => {
    mouseNormX = (e.clientX / window.innerWidth)  *  2 - 1;
    mouseNormY = (e.clientY / window.innerHeight) * -2 + 1;
    mouse.set(mouseNormX, mouseNormY);
  });

  // Collect all meshes with a back-reference to their parent group
  function collectMeshes() {
    const meshes = [];
    bunGroups.forEach(g => g.traverse(c => {
      if (c.isMesh) { c.userData.parentGroup = g; meshes.push(c); }
    }));
    return meshes;
  }

  // Squish a bun group on click / tap
  function squishGroup(group) {
    if (prefersReduced) return;
    const bs = group.userData.baseScale;
    group.scale.set(bs * 1.15, bs * 0.8, bs * 1.15);
    setTimeout(() => group.scale.setScalar(bs), 420);
  }

  window.addEventListener('mousedown', () => {
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(collectMeshes());
    if (hits.length > 0) squishGroup(hits[0].object.userData.parentGroup);
  });

  window.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    mouse.set((t.clientX / window.innerWidth) * 2 - 1, -(t.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(collectMeshes());
    if (hits.length > 0) squishGroup(hits[0].object.userData.parentGroup);
  }, { passive: true });

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    if (!prefersReduced) {
      // Gentle scene rotation toward cursor
      targetRotY += (mouseNormX * 0.12 - targetRotY) * 0.05;
      targetRotX += (-mouseNormY * 0.08 - targetRotX) * 0.05;
      scene.rotation.y = targetRotY;
      scene.rotation.x = targetRotX;

      bunGroups.forEach(group => {
        const { baseY, phase } = group.userData;
        group.position.y  = baseY + Math.sin(time * 0.6 + phase) * 0.35;
        group.rotation.y += 0.004;

        // Drip sway (small-radius cylinders = drip meshes)
        group.children.forEach((child, i) => {
          if (child.isMesh && child.geometry?.parameters?.radiusTop < 0.1) {
            child.rotation.z = Math.sin(time * 0.8 + i) * 0.06;
          }
        });
      });
    }

    renderer.render(scene, camera);
  }

  animate();
})();
