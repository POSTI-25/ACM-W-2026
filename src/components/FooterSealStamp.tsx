import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import fallbackImage from '../assets/footer/antique-brass-seal-stamp.webp';

export type FooterStampPose = { pitch: number; yaw: number; roll: number; lift: number; paperTilt: number };
export type FooterStampHandle = { setPose: (pose: FooterStampPose) => void };

/** The die is the origin. At pitch = PI/2 its handle follows the paper's +Z normal. */
const FooterSealStamp = forwardRef<FooterStampHandle>(function FooterSealStamp(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLImageElement>(null);
  const poseRef = useRef<FooterStampPose>({ pitch: .24, yaw: -.28, roll: -.1, lift: 1.5, paperTilt: 0 });
  const renderRef = useRef<((pose: FooterStampPose) => void) | null>(null);

  useImperativeHandle(ref, () => ({
    setPose(pose) {
      poseRef.current = { ...pose };
      renderRef.current?.(pose);
    },
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); }
    catch { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 4 / 5, .1, 40);
    camera.position.z = 12;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, .04);
    scene.environment = environment.texture;
    room.dispose();
    scene.add(new THREE.HemisphereLight(0xfff0d5, 0x42251b, 1.4));
    const key = new THREE.DirectionalLight(0xffedce, 3.4);
    key.position.set(-3, 5, 14);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = key.shadow.camera.bottom = -5;
    key.shadow.camera.right = key.shadow.camera.top = 5;
    key.shadow.bias = -.0004;
    key.shadow.normalBias = .018;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 2);
    rim.position.set(4, 2, 3);
    scene.add(rim);

    const grainCanvas = document.createElement('canvas');
    grainCanvas.width = 256;
    grainCanvas.height = 512;
    const ctx = grainCanvas.getContext('2d')!;
    const pixels = ctx.createImageData(256, 512);
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 256; x++) {
        const wave = x + 4 * Math.sin(y * .014) + 2 * Math.sin(y * .037 + x * .025);
        const grain = Math.sin(wave * .75) * 7 + Math.sin(wave * 1.9) * 4 + Math.sin(wave * .09) * 14;
        const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const noise = (hash - Math.floor(hash) - .5) * 7;
        const i = (y * 256 + x) * 4;
        pixels.data[i] = 78 + grain + noise;
        pixels.data[i + 1] = 36 + grain * .55 + noise;
        pixels.data[i + 2] = 18 + grain * .3 + noise;
        pixels.data[i + 3] = 255;
      }
    }
    ctx.putImageData(pixels, 0, 0);
    const grain = new THREE.CanvasTexture(grainCanvas);
    grain.colorSpace = THREE.SRGBColorSpace;
    grain.wrapS = THREE.RepeatWrapping;
    grain.repeat.set(2, 1);
    const wood = new THREE.MeshPhysicalMaterial({ map: grain, roughness: .37, clearcoat: .5, clearcoatRoughness: .25 });
    const brass = new THREE.MeshStandardMaterial({ color: 0xb98a3c, metalness: .86, roughness: .36, envMapIntensity: .7 });
    const engraving = new THREE.MeshStandardMaterial({ color: 0x765020, metalness: .78, roughness: .4 });
    const model = new THREE.Group();
    const lathe = (profile: number[][], material: THREE.Material) => {
      const curve = new THREE.CatmullRomCurve3(profile.map(([radius, y]) => new THREE.Vector3(radius, y, 0)));
      const points = curve.getPoints(120).map(point => new THREE.Vector2(Math.max(0, point.x), point.y));
      const mesh = new THREE.Mesh(new THREE.LatheGeometry(points, 64), material);
      mesh.castShadow = mesh.receiveShadow = true;
      model.add(mesh);
    };
    lathe([[0, .8], [.26, .8], [.32, .88], [.32, 1.02], [.23, 1.16],
      [.2, 1.5], [.23, 1.85], [.34, 2.4], [.45, 2.9], [.46, 3.23],
      [.38, 3.53], [.21, 3.73], [0, 3.8]], wood);
    lathe([[0, 0], [.67, 0], [.72, .045], [.72, .22], [.67, .28],
      [.34, .31], [.3, .4], [.2, .49], [.2, .69], [.3, .72],
      [.32, .81], [.26, .87], [0, .87]], brass);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.69, .015, 8, 64), engraving);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = .08;
    model.add(ring);
    const dieRing = new THREE.Mesh(new THREE.TorusGeometry(.55, .012, 8, 64), engraving);
    dieRing.rotation.x = Math.PI / 2;
    dieRing.position.y = -.008;
    model.add(dieRing);
    const letterPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-.3, -.01, -.2), new THREE.Vector3(-.17, -.01, .2),
      new THREE.Vector3(0, -.01, -.09), new THREE.Vector3(.17, -.01, .2), new THREE.Vector3(.3, -.01, -.2),
    ], false, 'catmullrom', .05);
    model.add(new THREE.Mesh(new THREE.TubeGeometry(letterPath, 28, .012, 6, false), engraving));
    scene.add(model);

    const shadowMaterial = new THREE.ShadowMaterial({ opacity: .1, depthWrite: false });
    const paperShadow = new THREE.Mesh(new THREE.PlaneGeometry(10, 12), shadowMaterial);
    paperShadow.position.z = -.05;
    paperShadow.receiveShadow = true;
    scene.add(paperShadow);
    const axis = new THREE.Vector3();
    const render = (pose: FooterStampPose) => {
      model.rotation.set(pose.pitch, pose.yaw, pose.roll);
      model.position.z = pose.lift;
      // Match the envelope's temporary CSS tilt; the canvas itself is a billboard.
      camera.position.set(0, -12 * Math.sin(pose.paperTilt), 12 * Math.cos(pose.paperTilt));
      camera.lookAt(0, 0, 0);
      axis.set(0, 1, 0).applyEuler(model.rotation);
      canvas.dataset.normalAlignment = axis.z.toFixed(5);
      canvas.dataset.lift = pose.lift.toFixed(3);
      renderer.render(scene, camera);
    };
    renderRef.current = render;
    const resize = () => {
      renderer.setSize(Math.max(1, canvas.clientWidth), Math.max(1, canvas.clientHeight), false);
      render(poseRef.current);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    canvas.style.opacity = '1';
    canvas.dataset.ready = 'true';
    if (fallbackRef.current) fallbackRef.current.hidden = true;

    return () => {
      observer.disconnect();
      renderRef.current = null;
      model.traverse(object => { if (object instanceof THREE.Mesh) object.geometry.dispose(); });
      paperShadow.geometry.dispose(); shadowMaterial.dispose();
      wood.dispose(); brass.dispose(); engraving.dispose(); grain.dispose();
      environment.dispose(); pmrem.dispose(); renderer.dispose();
    };
  }, []);

  return <div className="footer-stamp-model" aria-hidden="true">
    <canvas ref={canvasRef}/>
    <img ref={fallbackRef} src={fallbackImage} alt="" draggable={false}/>
  </div>;
});

export default FooterSealStamp;
