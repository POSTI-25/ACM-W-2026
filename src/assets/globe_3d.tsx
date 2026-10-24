import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";

export type Globe3DHandle = {
  /** The Three.js Group containing the globe sphere + country lines */
  group: THREE.Group | undefined;
  /** The Three.js camera (animate camera.position.z for zoom) */
  camera: THREE.PerspectiveCamera | undefined;
  /** Toggle idle auto-rotation on/off */
  setAutoRotate: (enabled: boolean) => void;
  /** Toggle pointer-drag rotation on/off */
  setDragEnabled: (enabled: boolean) => void;
  setCountryHighlight: (countryId: string | null) => void;
  countryBounds: (countryId: string) => { x: number; y: number; width: number; height: number } | undefined;
};

type Globe3DProps = {
  size?: number | string;
  lineColor?: string;
  sphereColor?: string;
  rotationSpeed?: number;
  initialRotX?: number;
  initialRotY?: number;
  enableDrag?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

type GlobeInternals = {
  group?: THREE.Group;
  camera?: THREE.PerspectiveCamera;
  renderer?: THREE.WebGLRenderer;
  scene?: THREE.Scene;
  highlightCountry?: (countryId: string | null) => void;
  countryBounds?: Globe3DHandle['countryBounds'];
};

type GeoGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

type GeoFeature = { id: string; geometry: GeoGeometry };

const Globe3D = forwardRef<Globe3DHandle, Globe3DProps>(function Globe3D(
  {
    size = 900,
    lineColor = "#5d0f14",
    sphereColor = "#fff9e9",
    rotationSpeed = 0.002,
    initialRotX = 0.2,
    initialRotY = 0,
    enableDrag = true,
    className = "",
    style = {},
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const internals = useRef<GlobeInternals>({});
  const autoRotateRef = useRef(true);
  const dragEnabledRef = useRef(enableDrag);
  const highlightedRef = useRef<string | null>(null);

  // Keep dragEnabledRef in sync with prop
  useEffect(() => {
    dragEnabledRef.current = enableDrag;
  }, [enableDrag]);

  useImperativeHandle(ref, () => ({
    get group() {
      return internals.current.group;
    },
    get camera() {
      return internals.current.camera;
    },
    setAutoRotate(enabled: boolean) {
      autoRotateRef.current = enabled;
    },
    setDragEnabled(enabled: boolean) {
      dragEnabledRef.current = enabled;
    },
    setCountryHighlight(countryId: string | null) {
      if (highlightedRef.current === countryId) return;
      highlightedRef.current = countryId;
      internals.current.highlightCountry?.(countryId);
    },
    countryBounds(countryId: string) {
      return internals.current.countryBounds?.(countryId);
    },
  }));

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();

    /*
     * Camera distance 3.0 ensures the unit-radius sphere
     * (visual half-angle ≈ asin(1/3) ≈ 19.5°) fits comfortably
     * within the 45° FOV (half = 22.5°), leaving ~3° margin
     * on every side and eliminating the rectangular-clipping artifact.
     */
    /*
     * near = 0.1, not 0.01: the closest the camera gets is z 2.75 (the
     * gentle country zoom), leaving ample clearance from the surface. 0.1 is
     * still a comfortable margin — and it buys ~10x the depth-buffer precision,
     * which is what keeps the country lines from sparkling against the sphere
     * when zoomed in.
     */
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3.0;

    const resizeRenderer = () => {
      const rect = container.getBoundingClientRect();
      const fallbackSize = typeof size === "number" ? size : 900;
      const width = Math.max(1, Math.round(rect.width || fallbackSize));
      const height = Math.max(1, Math.round(rect.height || fallbackSize));

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resizeRenderer();
    const resizeObserver = new ResizeObserver(resizeRenderer);
    resizeObserver.observe(container);

    const radius = 1;
    const group = new THREE.Group();
    scene.add(group);

    /*
     * YXZ keeps horizontal globe spin isolated from the fixed presentation
     * tilt. Country focus logic can then center latitude with translation
     * instead of pitching the globe per country.
     */
    group.rotation.order = "YXZ";

    // Sphere fill (the "body" of the globe)
    const sphereGeometry = new THREE.SphereGeometry(radius, 64, 64);
    group.add(
      new THREE.Mesh(
        sphereGeometry,
        new THREE.MeshBasicMaterial({ color: new THREE.Color(sphereColor) }),
      ),
    );

    // Subtle rim/outline shadow
    const rimGeometry = new THREE.SphereGeometry(radius + 0.018, 64, 64);
    group.add(
      new THREE.Mesh(
        rimGeometry,
        new THREE.MeshBasicMaterial({
          color: 0x333333,
          transparent: true,
          opacity: 0.12,
          side: THREE.BackSide,
        }),
      ),
    );

    // Country border lines
    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(lineColor),
    });

    /*
     * Every country ring feeds ONE shared vertex buffer. Giving each ring its
     * own LineSegments meant hundreds of draw calls per frame, which is what
     * made the scroll-driven rotation stutter once the globe was scaled up to
     * full-viewport size.
     */
    const linePositions: number[] = [];

    /* Lifted 0.2% off the surface so the borders aren't exactly coplanar with
       the sphere. Sub-pixel at any real size, but it removes the depth tie that
       makes lines flicker in and out at grazing angles. */
    const lineRadius = radius * 1.002;

    function pushVertex(lat: number, lng: number, positions = linePositions) {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lng + 180) * Math.PI) / 180;
      const sinPhi = Math.sin(phi);
      positions.push(
        -lineRadius * sinPhi * Math.cos(theta),
        lineRadius * Math.cos(phi),
        lineRadius * sinPhi * Math.sin(theta),
      );
    }

    function addRing(coords: number[][]) {
      for (let i = 0; i < coords.length - 1; i += 1) {
        pushVertex(coords[i][1], coords[i][0]);
        pushVertex(coords[i + 1][1], coords[i + 1][0]);
      }
    }

    function addFeature(geom: GeoGeometry) {
      if (geom.type === "Polygon") {
        (geom.coordinates as number[][][]).forEach(addRing);
      }
      if (geom.type === "MultiPolygon") {
        (geom.coordinates as number[][][][]).forEach((polygon) =>
          polygon.forEach(addRing),
        );
      }
    }

    // Fine meridians keep the spherical turn legible even over open oceans.
    // One shared buffer adds only one draw call per globe.
    const gridPositions: number[] = [];
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lng = -180; lng < 180; lng += 3) {
        pushVertex(lat, lng, gridPositions);
        pushVertex(lat, lng + 3, gridPositions);
      }
    }
    for (let lng = -180; lng < 180; lng += 30) {
      for (let lat = -90; lat < 90; lat += 3) {
        pushVertex(lat, lng, gridPositions);
        pushVertex(lat + 3, lng, gridPositions);
      }
    }
    const gridGeometry = new THREE.BufferGeometry();
    gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
    const gridMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(lineColor), transparent: true, opacity: .18, depthWrite: false,
    });
    group.add(new THREE.LineSegments(gridGeometry, gridMaterial));

    const countries = new Map<string, GeoGeometry>();
    const polygons = (geometry: GeoGeometry): number[][][][] => geometry.type === 'Polygon'
      ? [geometry.coordinates as number[][][]] : geometry.coordinates as number[][][][];
    const geographicPoint = (lng: number, lat: number) => {
      const phi = lat * Math.PI / 180, theta = lng * Math.PI / 180;
      return new THREE.Vector3(Math.cos(phi) * Math.cos(theta), Math.sin(phi), -Math.cos(phi) * Math.sin(theta));
    };
    let highlightTexture: THREE.CanvasTexture | undefined;
    let highlightGeometry: THREE.SphereGeometry | undefined;
    let highlightMaterial: THREE.MeshBasicMaterial | undefined;
    let highlightCanvas: HTMLCanvasElement | undefined;
    const highlightCountry = (countryId: string | null) => {
      if (!highlightCanvas && !countryId) return;
      if (!highlightCanvas) {
        highlightCanvas = document.createElement('canvas');
        highlightCanvas.width = 2048;
        highlightCanvas.height = 1024;
        highlightTexture = new THREE.CanvasTexture(highlightCanvas);
        highlightTexture.colorSpace = THREE.SRGBColorSpace;
        highlightGeometry = new THREE.SphereGeometry(radius * 1.006, 128, 64);
        highlightMaterial = new THREE.MeshBasicMaterial({
          map: highlightTexture, transparent: true, alphaTest: .01, depthWrite: false,
        });
        group.add(new THREE.Mesh(highlightGeometry, highlightMaterial));
      }
      const context = highlightCanvas.getContext('2d');
      if (!context) return;
      const w = highlightCanvas.width, h = highlightCanvas.height;
      context.clearRect(0, 0, w, h);
      const geometry = countryId ? countries.get(countryId) : undefined;
      if (geometry) {
        context.fillStyle = '#812633';
        context.strokeStyle = '#a54a54';
        context.lineWidth = 1.5;
        for (const polygon of polygons(geometry)) {
          for (const shift of [-w, 0, w]) {
            context.beginPath();
            for (const ring of polygon) {
              let previous = ring[0][0];
              ring.forEach(([longitude, latitude], index) => {
                let lng = longitude;
                while (lng - previous > 180) lng -= 360;
                while (lng - previous < -180) lng += 360;
                previous = lng;
                const x = (lng + 180) / 360 * w + shift;
                const y = (90 - latitude) / 180 * h;
                if (index) context.lineTo(x, y); else context.moveTo(x, y);
              });
              context.closePath();
            }
            context.fill('evenodd');
            context.stroke();
          }
        }
      }
      highlightTexture!.needsUpdate = true;
    };
    const countryBounds: Globe3DHandle['countryBounds'] = countryId => {
      const geometry = countries.get(countryId);
      if (!geometry) return undefined;
      group.updateMatrixWorld(true);
      camera.updateMatrixWorld();
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const polygon of polygons(geometry)) for (const ring of polygon) for (const [lng, lat] of ring) {
        const point = geographicPoint(lng, lat).applyMatrix4(group.matrixWorld);
        if (point.z <= 0) continue;
        point.project(camera);
        const x = (point.x + 1) / 2, y = (1 - point.y) / 2;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
      return Number.isFinite(minX) ? { x: minX, y: minY, width: maxX - minX, height: maxY - minY } : undefined;
    };

    // Bundled Natural Earth geometry works without runtime CDN scripts or requests.
    let disposed = false;
    let lineGeometry: THREE.BufferGeometry | undefined;
    void (async () => {
      try {
        const world = (await import('./globe/countries-110m.geo.json')).default as { features: GeoFeature[] };
        if (disposed) return;
        for (const feature of world.features) {
          countries.set(feature.id, feature.geometry);
          addFeature(feature.geometry);
        }
        lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        group.add(new THREE.LineSegments(lineGeometry, lineMat));
        highlightCountry(highlightedRef.current);
      } catch {
        // The locally generated graticule remains a usable globe if a chunk fails.
      }
    })();

    group.rotation.x = initialRotX;
    group.rotation.y = initialRotY;

    /* ─── Pointer drag ─── */
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let animationId = 0;

    const onPointerDown = (event: PointerEvent) => {
      if (!dragEnabledRef.current) return;
      isDragging = true;
      prevX = event.clientX;
      prevY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      const dx = event.clientX - prevX;
      const dy = event.clientY - prevY;
      group.rotation.y += dx * 0.005;
      group.rotation.x += dy * 0.003;
      group.rotation.x = Math.max(-1.2, Math.min(1.2, group.rotation.x));
      prevX = event.clientX;
      prevY = event.clientY;
    };

    const onPointerUp = (event: PointerEvent) => {
      isDragging = false;
      canvas.releasePointerCapture(event.pointerId);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    /* ─── Render loop ─── */
    let previousTime = 0;
    let inView = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const visibility = new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting);
    }, { rootMargin: '160px' });
    visibility.observe(container);
    function animate(time: number) {
      animationId = requestAnimationFrame(animate);
      const delta = previousTime ? Math.min((time - previousTime) / 1000, .05) : 0;
      previousTime = time;
      if (!inView || document.hidden) return;

      // Keep the same gentle speed on 60Hz and high-refresh-rate screens.
      if (!isDragging && autoRotateRef.current && !reducedMotion.matches) {
        group.rotation.y += rotationSpeed * delta * 60;
      }

      renderer.render(scene, camera);
    }

    animationId = requestAnimationFrame(animate);

    internals.current = { group, camera, renderer, scene, highlightCountry, countryBounds };

    return () => {
      disposed = true;
      cancelAnimationFrame(animationId);
      visibility.disconnect();
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      renderer.dispose();
      sphereGeometry.dispose();
      rimGeometry.dispose();
      lineMat.dispose();
      gridGeometry.dispose();
      gridMaterial.dispose();
      lineGeometry?.dispose();
      highlightGeometry?.dispose();
      highlightMaterial?.dispose();
      highlightTexture?.dispose();
      internals.current = {};
    };
  }, [initialRotX, initialRotY, lineColor, rotationSpeed, size, sphereColor]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: size,
        height: size,
        background: "transparent",
        cursor: enableDrag ? "grab" : "default",
        userSelect: "none",
        flexShrink: 0,
        touchAction: "none",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          border: "none",
          outline: "none",
        }}
      />
    </div>
  );
});

export default Globe3D;
