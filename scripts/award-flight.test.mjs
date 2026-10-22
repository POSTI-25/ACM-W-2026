import test from 'node:test';
import assert from 'node:assert/strict';
import { awardHeartCue, sampleAwardFlight, sampleHeartOutline } from '../src/components/awardFlightMotion.ts';

const pose = p => sampleAwardFlight(p, 1280, 700, {});
const near = (a, b, epsilon = 1e-6) => assert.ok(Math.abs(a - b) < epsilon, `${a} != ${b}`);

test('the flight and camera loop close without a position or attitude seam', () => {
  const start = pose(0), end = pose(1);
  for (const field of ['x', 'y', 'z', 'dx', 'dy', 'dz', 'bank', 'roll']) near(start[field], end[field]);
  near(Math.cos(start.orbit), Math.cos(end.orbit));
  near(Math.sin(start.orbit), Math.sin(end.orbit));
});

test('trajectory remains finite, changes altitude, and banks both ways to knife-edge', () => {
  const samples = Array.from({ length: 2001 }, (_, i) => pose(i / 2000));
  for (const sample of samples) {
    assert.ok(Object.values(sample).every(Number.isFinite));
    assert.ok(Math.hypot(sample.dx, sample.dy, sample.dz) > 10);
    assert.ok(Math.abs(sample.bank) <= Math.PI / 2 + 1e-6);
  }
  assert.ok(Math.max(...samples.map(p => p.bank)) > 1.55);
  assert.ok(Math.min(...samples.map(p => p.bank)) < -1.55);
  assert.ok(Math.max(...samples.map(p => p.z)) - Math.min(...samples.map(p => p.z)) > 300);
});

test('complete rolls include a held inversion, then recover before the next loop', () => {
  near(pose(.30).roll, Math.PI * 2);
  near(pose(.63).roll, Math.PI * 3);
  near(pose(.63).bank, 0);
  near(pose(.79).roll, Math.PI * 2);
  near(pose(1).roll, 0);
});

test('straightaway bursts have a measurable speed change without stopping', () => {
  const speeds = [];
  const step = 1 / 4000;
  for (let p = 0; p < 1 - step; p += step) {
    const a = pose(p), b = pose(p + step);
    speeds.push(Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) / step);
  }
  assert.ok(Math.min(...speeds) > 0);
  assert.ok(Math.max(...speeds) / Math.min(...speeds) > 2);
});

test('the ink trail fades by elapsed time and keeps stationary buffers finite', async () => {
  const THREE = await import('three');
  const { createAwardInkTrail } = await import('../src/components/awardFlightTrail.ts');
  const trail = createAwardInkTrail();
  const point = new THREE.Vector3(20, 30, 40);
  trail.update(point, 0);
  trail.update(point, 1);
  const geometry = trail.mesh.geometry;
  const ages = geometry.getAttribute('aFreshness').array;
  near(ages[0], 1);
  near(ages[4], 1 - 1 / 3.2);
  trail.update(point, 4.3);
  near(ages[4], 0);
  for (const name of ['position', 'aPrevious', 'aNext', 'aFreshness']) {
    assert.ok([...geometry.getAttribute(name).array].every(Number.isFinite));
  }
  trail.dispose();
});

test('the ink ribbon uses responsive pixel widths and resets cleanly on resize', async () => {
  const THREE = await import('three');
  const { createAwardInkTrail } = await import('../src/components/awardFlightTrail.ts');
  const trail = createAwardInkTrail();
  trail.resize(1280, 700);
  near(trail.mesh.material.uniforms.uWidth.value, 5.5);
  trail.resize(390, 600);
  near(trail.mesh.material.uniforms.uWidth.value, 4.25);
  near(trail.mesh.material.uniforms.uResolution.value.x, 390);
  trail.update(new THREE.Vector3(100, 50, 10), 10);
  const position = trail.mesh.geometry.getAttribute('position');
  near(position.getX(0), 100);
  near(position.getY(0), 50);
  near(position.getZ(0), 10);
  trail.dispose();
});

test('the heart is closed, has two lobes and a pointed lower tip', () => {
  const a = sampleHeartOutline(0, {}), b = sampleHeartOutline(1, {});
  near(a.x, b.x); near(a.y, b.y);
  assert.ok(sampleHeartOutline(.25, {}).x > .9);
  assert.ok(sampleHeartOutline(.75, {}).x < -.9);
  assert.ok(sampleHeartOutline(.5, {}).y < -.95);
  assert.ok(sampleHeartOutline(.12, {}).y > a.y);
});

test('the heart cue holds the camera and preserves the trail long enough to close', () => {
  near(awardHeartCue(.25).blend, 0);
  near(awardHeartCue(.40).blend, 1);
  near(awardHeartCue(.40).cameraPhase, .30);
  near(awardHeartCue(.50).progress, 1);
  assert.ok(awardHeartCue(.50).lifetime >= 6);
  near(awardHeartCue(.75).blend, 0);
  near(awardHeartCue(1).cameraPhase, 1);
  near(awardHeartCue(1).lifetime, 3.2);
});

test('the wider flight envelope reaches beyond the previous half-width limit', () => {
  const samples = Array.from({ length: 1000 }, (_, i) => pose(i / 1000));
  assert.ok(Math.max(...samples.map(p => p.x)) > 1280 * .70);
  assert.ok(Math.min(...samples.map(p => p.x)) < -1280 * .70);
});
