import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleAwardFlight } from '../src/components/awardFlightMotion.ts';

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
