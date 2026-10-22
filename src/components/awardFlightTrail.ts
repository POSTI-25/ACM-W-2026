import * as THREE from 'three';

const SAMPLES = 384;
const LIFETIME = 3.2;
const SAMPLE_INTERVAL = 1 / 60;

/** Camera-facing ink ribbon: WebGL line primitives cannot provide reliable thick strokes. */
export function createAwardInkTrail() {
  const positions = new Float32Array(SAMPLES * 2 * 3);
  const previous = new Float32Array(positions.length);
  const next = new Float32Array(positions.length);
  const sides = new Float32Array(SAMPLES * 2);
  const freshness = new Float32Array(SAMPLES * 2);
  const distances = new Float32Array(SAMPLES * 2);
  const projected = new THREE.Vector3();
  const indices = new Uint16Array((SAMPLES - 1) * 6);
  const history = Array.from({ length: SAMPLES }, () => new THREE.Vector3());
  const timestamps = new Float64Array(SAMPLES);
  for (let i = 0; i < SAMPLES; i++) {
    sides[i * 2] = -1;
    sides[i * 2 + 1] = 1;
    if (i < SAMPLES - 1) {
      const a = i * 2, offset = i * 6;
      indices.set([a, a + 1, a + 2, a + 1, a + 3, a + 2], offset);
    }
  }
  const geometry = new THREE.BufferGeometry();
  const dynamic = (array: Float32Array, size: number) => new THREE.BufferAttribute(array, size).setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position', dynamic(positions, 3));
  geometry.setAttribute('aPrevious', dynamic(previous, 3));
  geometry.setAttribute('aNext', dynamic(next, 3));
  geometry.setAttribute('aFreshness', dynamic(freshness, 1));
  geometry.setAttribute('aDistance', dynamic(distances, 1));
  geometry.setAttribute('aSide', new THREE.BufferAttribute(sides, 1));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uResolution: { value: new THREE.Vector2(1, 1) }, uWidth: { value: 5.5 }, uSpacing: { value: 16 } },
    vertexShader: `
      attribute vec3 aPrevious;
      attribute vec3 aNext;
      attribute float aSide;
      attribute float aFreshness;
      attribute float aDistance;
      uniform vec2 uResolution;
      uniform float uWidth;
      varying float vAcross;
      varying float vFreshness;
      varying float vDistance;
      varying float vRadius;
      void main() {
        vec4 current = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vec4 before = projectionMatrix * modelViewMatrix * vec4(aPrevious, 1.0);
        vec4 after = projectionMatrix * modelViewMatrix * vec4(aNext, 1.0);
        vec2 direction = (after.xy / after.w - before.xy / before.w) * uResolution;
        float magnitude = length(direction);
        direction = magnitude > 0.0001 ? direction / magnitude : vec2(1.0, 0.0);
        vec2 normal = vec2(-direction.y, direction.x);
        float taper = mix(0.22, 1.0, pow(aFreshness, 0.55));
        current.xy += normal * aSide * uWidth * taper / uResolution * current.w;
        gl_Position = current;
        vAcross = aSide;
        vFreshness = aFreshness;
        vDistance = aDistance;
        vRadius = uWidth * taper * 0.5;
      }`,
    fragmentShader: `
      varying float vAcross;
      varying float vFreshness;
      varying float vDistance;
      varying float vRadius;
      uniform float uSpacing;
      void main() {
        float along = mod(vDistance + uSpacing * 0.5, uSpacing) - uSpacing * 0.5;
        float dotDistance = length(vec2(along, vAcross * vRadius)) - vRadius;
        float edge = 1.0 - smoothstep(-0.6, 0.6, dotDistance);
        float alpha = 0.94 * pow(vFreshness, 1.1) * edge;
        gl_FragColor = vec4(0.105, 0.075, 0.055, alpha);
      }`,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;
  let index = 0;
  let ready = false;
  let lastStored = -Infinity;

  return {
    mesh,
    reset() { ready = false; lastStored = -Infinity; },
    resize(width: number, height: number) {
      material.uniforms.uResolution.value.set(width, height);
      material.uniforms.uWidth.value = width < 640 ? 4.25 : 5.5;
      material.uniforms.uSpacing.value = width < 640 ? 12 : 16;
      ready = false;
    },
    update(tail: THREE.Vector3, time: number, camera?: THREE.Camera, lifetime = LIFETIME) {
      if (!ready) {
        history.forEach(point => point.copy(tail));
        timestamps.fill(time - 6.4);
        ready = true;
      }
      if (time - lastStored >= SAMPLE_INTERVAL - 1e-6) {
        index = (index + 1) % SAMPLES;
        history[index].copy(tail);
        timestamps[index] = time;
        lastStored = time;
      }
      let distance = 0, lastX = 0, lastY = 0;
      for (let i = 0; i < SAMPLES; i++) {
        const slot = (index - Math.max(0, i - 1) + SAMPLES) % SAMPLES;
        const point = i === 0 ? tail : history[slot];
        const age = i === 0 ? 0 : time - timestamps[slot];
        const strength = Math.max(0, Math.min(1, 1 - age / lifetime));
        projected.copy(point);
        if (camera) {
          projected.project(camera);
          projected.x *= material.uniforms.uResolution.value.x / 2;
          projected.y *= material.uniforms.uResolution.value.y / 2;
        }
        if (i) distance += Math.hypot(projected.x - lastX, projected.y - lastY);
        lastX = projected.x;
        lastY = projected.y;
        for (let side = 0; side < 2; side++) {
          const vertex = i * 2 + side, offset = vertex * 3;
          positions[offset] = point.x;
          positions[offset + 1] = point.y;
          positions[offset + 2] = point.z;
          freshness[vertex] = strength;
          distances[vertex] = distance;
        }
      }
      for (let i = 0; i < SAMPLES; i++) {
        const before = Math.max(0, i - 1) * 6;
        const after = Math.min(SAMPLES - 1, i + 1) * 6;
        for (let side = 0; side < 2; side++) {
          const offset = (i * 2 + side) * 3;
          for (let axis = 0; axis < 3; axis++) {
            previous[offset + axis] = positions[before + axis];
            next[offset + axis] = positions[after + axis];
          }
        }
      }
      for (const name of ['position', 'aPrevious', 'aNext', 'aFreshness', 'aDistance']) geometry.getAttribute(name).needsUpdate = true;
    },
    dispose() { geometry.dispose(); material.dispose(); },
  };
}
