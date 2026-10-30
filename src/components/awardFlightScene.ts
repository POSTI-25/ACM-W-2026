import * as THREE from 'three';
import { awardHeartCue, sampleAwardFlight, sampleHeartOutline, type FlightPose } from './awardFlightMotion';
import { createAwardInkTrail } from './awardFlightTrail';
import { createAwardFlightAccents } from './awardFlightAccents';

export type AwardFlightController = { setActive(active: boolean): void; dispose(): void };
const TAU = Math.PI * 2;

/** Small folded mesh: four paper panels, a keel, and warm cut-paper crease lines. */
function makePlane() {
  const nose = [1.60, 0, .03], keel = [-1.02, 0, -.28];
  const left = [-1.12, .22, .08], leftWing = [-1.35, 1, .12];
  const right = [-1.12, -.22, .08], rightWing = [-1.35, -1, .12];
  const faces = [nose, left, leftWing, nose, keel, left, nose, rightWing, right, nose, right, keel];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(faces.flat(), 3));
  geometry.computeVertexNormals();
  geometry.addGroup(0, 3, 0);
  geometry.addGroup(3, 3, 1);
  geometry.addGroup(6, 3, 0);
  geometry.addGroup(9, 3, 1);
  const materials = [0xd8b780, 0xa47b49].map(color => new THREE.MeshStandardMaterial({
    color, roughness: .96, metalness: 0, side: THREE.DoubleSide,
  }));
  const plane = new THREE.Group();
  plane.add(new THREE.Mesh(geometry, materials));
  const edges = new THREE.EdgesGeometry(geometry, 12);
  const ink = new THREE.LineBasicMaterial({ color: 0x654326, transparent: true, opacity: .76 });
  plane.add(new THREE.LineSegments(edges, ink));
  return { plane, dispose: () => { geometry.dispose(); edges.dispose(); ink.dispose(); materials.forEach(m => m.dispose()); } };
}

/** Real perspective scene; its camera moves independently from the DOM award. */
export function createAwardFlight(host: HTMLElement, stage: HTMLElement, banner: HTMLElement): AwardFlightController | null {
  const canvas = document.createElement('canvas');
  canvas.className = 'award-flight-canvas';
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.appendChild(canvas);
  host.dataset.renderer = 'webgl';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 1, 10000);
  scene.add(new THREE.AmbientLight(0xffedce, 1.7));
  const key = new THREE.DirectionalLight(0xfff2d6, 3);
  key.position.set(-250, 450, 700);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd7b28e, .8);
  fill.position.set(350, -200, -500);
  scene.add(fill);
  const aircraft = makePlane();
  scene.add(aircraft.plane);

  const trail = createAwardInkTrail();
  scene.add(trail.mesh);
  const tail = new THREE.Vector3();
  const accents = createAwardFlightAccents(host, banner);
  const heartWorld = new THREE.Vector3(), previousPosition = new THREE.Vector3();
  const heartPoint = { x: 0, y: 0 };
  const heartCenter = new THREE.Vector2();
  let heartX = 100, heartY = 90, hasPreviousPosition = false;

  let width = 1, height = 1, distance = 1000;
  let frame: number | undefined;
  let active = false;
  let lost = false;
  let disposed = false;
  // Introduce the celebratory heart near the start of the first visible pass.
  let elapsed = 8.2;
  let previousTime: number | undefined;
  let initialized = false;
  const pose: FlightPose = { x: 0, y: 0, z: 0, dx: 0, dy: 0, dz: 0, bank: 0, roll: 0, orbit: 0 };
  const cameraPose: FlightPose = { ...pose };
  const forward = new THREE.Vector3(), side = new THREE.Vector3(), up = new THREE.Vector3();
  const worldUp = new THREE.Vector3(0, 0, 1), rollAxis = new THREE.Vector3(1, 0, 0);
  const basis = new THREE.Matrix4(), attitude = new THREE.Quaternion(), roll = new THREE.Quaternion();
  const heartAttitude = new THREE.Quaternion(), heartRoll = new THREE.Quaternion();
  const cameraPosition = new THREE.Vector3(), cameraAim = new THREE.Vector3(), targetAim = new THREE.Vector3();

  const measure = () => {
    const bounds = host.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    distance = Math.max(height * 1.2, width * .9);
    renderer.setSize(Math.round(width), Math.round(height), false);
    camera.aspect = width / height;
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(height / (2 * distance)));
    camera.updateProjectionMatrix();
    aircraft.plane.scale.setScalar(width < 640 ? 30 : 36);
    // Softly attenuate the flight behind type, preserving both legibility and motion.
    const holes = [...banner.querySelectorAll('h2, p')].map(element => {
      const rect = element.getBoundingClientRect();
      const x = rect.left - bounds.left - 16, y = rect.top - bounds.top - 16;
      const w = rect.width + 32, h = rect.height + 32;
      return `M${x} ${y}h${w}v${h}h${-w}Z`;
    }).join(' ');
    const mask = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><filter id="soft"><feGaussianBlur stdDeviation="6"/></filter><mask id="type"><rect width="100%" height="100%" fill="white"/><path fill="black" opacity=".86" filter="url(#soft)" d="${holes}"/></mask></defs><rect width="100%" height="100%" fill="white" mask="url(#type)"/></svg>`;
    const maskImage = `url("data:image/svg+xml,${encodeURIComponent(mask)}")`;
    host.style.maskImage = maskImage;
    host.style.setProperty('-webkit-mask-image', maskImage);
    trail.resize(width, height);
    accents.resize(width, height);
    const credit = banner.querySelector('p')!.getBoundingClientRect();
    // Leave clearance for the aircraft and ink dots, not just the path center.
    const heartTop = credit.bottom - bounds.top + 15;
    const flightClearance = 64;
    heartY = Math.min(90, Math.max(1, (height - heartTop - flightClearance) / 2));
    heartX = Math.min(width < 640 ? 82 : 105, width * .22);
    heartCenter.set(width * (width < 640 ? .55 : .67), heartTop + heartY);
    hasPreviousPosition = false;
  };

  const render = (dt: number) => {
    const phase = (elapsed / 26) % 1;
    sampleAwardFlight(phase, width, height, pose);
    const heart = awardHeartCue(phase);
    sampleAwardFlight(heart.cameraPhase, width, height, cameraPose);
    aircraft.plane.position.set(pose.x, pose.y, pose.z);

    // Complete camera orbit: overhead tracking -> low side profile -> opposite side.
    cameraPosition.set(Math.sin(cameraPose.orbit) * distance * 1.2,
      Math.sin(TAU * 2 * heart.cameraPhase - .4) * distance * .10,
      Math.cos(cameraPose.orbit) * distance * 1.2);
    camera.position.lerp(cameraPosition, initialized ? 1 - Math.exp(-dt * 4) : 1);
    targetAim.set(cameraPose.x, cameraPose.y, cameraPose.z).multiplyScalar(.13);
    cameraAim.lerp(targetAim, initialized ? 1 - Math.exp(-dt * 3.5) : 1);
    camera.up.set(Math.sin(TAU * 3 * heart.cameraPhase) * .018, 1, 0).normalize();
    camera.lookAt(cameraAim);
    camera.updateMatrixWorld();

    if (heart.blend > 0) {
      sampleHeartOutline(heart.progress + .015, heartPoint);
      const depth = camera.position.distanceTo(cameraAim) * (1 + .025 * Math.sin(heart.progress * TAU * 2));
      const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * depth;
      heartWorld.set((heartCenter.x + heartX * heartPoint.x - width / 2) / height * viewHeight,
        (height / 2 - heartCenter.y + heartY * heartPoint.y) / height * viewHeight, -depth)
        .applyQuaternion(camera.quaternion).add(camera.position);
      aircraft.plane.position.lerp(heartWorld, heart.blend);
    }
    if (hasPreviousPosition && dt > 0) forward.subVectors(aircraft.plane.position, previousPosition);
    else forward.set(pose.dx, pose.dy, pose.dz);
    if (forward.lengthSq() < .0001) forward.set(pose.dx, pose.dy, pose.dz);
    forward.normalize();
    previousPosition.copy(aircraft.plane.position);
    hasPreviousPosition = true;
    side.crossVectors(worldUp, forward).normalize();
    up.crossVectors(forward, side).normalize();
    basis.makeBasis(forward, side, up);
    attitude.setFromRotationMatrix(basis);
    heartAttitude.copy(attitude);
    roll.setFromAxisAngle(rollAxis, pose.bank + pose.roll);
    attitude.multiply(roll);
    heartRoll.setFromAxisAngle(rollAxis, Math.sin(heart.progress * TAU) * .45);
    heartAttitude.multiply(heartRoll);
    attitude.slerp(heartAttitude, heart.blend);
    aircraft.plane.quaternion.slerp(attitude, initialized ? 1 - Math.exp(-dt * 13) : 1);

    tail.set(-1.15, 0, -.05).multiplyScalar(aircraft.plane.scale.x)
      .applyQuaternion(aircraft.plane.quaternion).add(aircraft.plane.position);
    tail.lerp(aircraft.plane.position, heart.blend);
    trail.update(tail, elapsed, camera, heart.lifetime);
    accents.update(aircraft.plane.position, camera, elapsed, phase, pose.bank, heart.blend);
    renderer.render(scene, camera);
    initialized = true;
  };
  const tick = (now: number) => {
    if (!active || lost || disposed) return;
    const dt = previousTime === undefined ? 0 : Math.min((now - previousTime) / 1000, .15);
    previousTime = now;
    elapsed += dt;
    render(Math.min(dt, .05));
    frame = requestAnimationFrame(tick);
  };
  const setActive = (next: boolean) => {
    active = next;
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
    previousTime = undefined;
    if (active && !lost && !disposed) frame = requestAnimationFrame(tick);
  };
  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    host.dataset.renderer = 'fallback';
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  };
  const onRestored = () => {
    lost = false;
    host.dataset.renderer = 'webgl';
    measure();
    setActive(active);
  };
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);
  measure();
  render(0);
  const resize = new ResizeObserver(measure);
  resize.observe(stage);
  resize.observe(host);
  void document.fonts.ready.then(() => { if (!disposed) measure(); });
  document.fonts.addEventListener('loadingdone', measure);

  return {
    setActive,
    dispose() {
      disposed = true;
      setActive(false);
      resize.disconnect();
      document.fonts.removeEventListener('loadingdone', measure);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      aircraft.dispose();
      trail.dispose();
      accents.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      host.style.removeProperty('mask-image');
      host.style.removeProperty('-webkit-mask-image');
      host.dataset.renderer = 'fallback';
    },
  };
}
