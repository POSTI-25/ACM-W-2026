import test from 'node:test';
import assert from 'node:assert/strict';
import { FULL_PULL, landingCordPose, landingPull } from '../src/components/landingCord.ts';
import { createCordFall } from '../src/components/landingCordPhysics.ts';
import { ropeDistance as distance, ropeSpines, sampleRope } from '../src/components/juteRopeGeometry.ts';

const length = points => points.slice(1).reduce((sum, p, i) => sum + distance(p, points[i]), 0);
const sections = pose => pose.sections.map(({ points }) => points);

function assertConnected(pieces) {
  assert.ok(pieces.flat().every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y)));
  for (let i = 1; i < pieces.length; i++) {
    assert.ok(distance(pieces[i][0], pieces[i - 1].at(-1)) < .02);
  }
}

test('drag meets resistance before the loops shrink and feed the free tail', () => {
  const tied = landingCordPose();
  const tension = landingPull(10, 0);
  assert.equal(tension.progress, 0);
  assert.ok(tension.x > 0 && tension.x < 5);
  const partial = landingCordPose(landingPull(56, 0));
  const released = landingCordPose(landingPull(FULL_PULL, 0));
  assert.ok(length(sampleRope(partial.tail)) > length(sampleRope(tied.tail)) + 100);
  assert.ok(length(sampleRope(released.tail)) > length(sampleRope(partial.tail)) + 150);

  const tiedLength = sections(tied).reduce((sum, piece) => sum + length(piece), 0);
  for (let amount = 0; amount <= FULL_PULL; amount += 4) {
    const pieces = sections(landingCordPose(landingPull(amount, 0)));
    assertConnected(pieces);
    assert.ok(Math.abs(pieces.reduce((sum, piece) => sum + length(piece), 0) / tiedLength - 1) < .05);
    // Each front/back join follows the same curve, rather than folding back sharply.
    for (let i = 1; i < pieces.length; i++) {
      const before = pieces[i - 1].at(-2), join = pieces[i][0], after = pieces[i][1];
      const dot = (join.x - before.x) * (after.x - join.x) + (join.y - before.y) * (after.y - join.y);
      assert.ok(dot > 0, `wrap ${i} should have a rounded turn at pull ${amount}`);
    }
  }
});

test('gravity takes over at the current pose and carries the entire rope off screen', () => {
  for (const [x, y] of [[120, 0], [0, 120], [0, -120], [-120, 0]]) {
    const seed = sections(landingCordPose(landingPull(x, y)));
    const fall = createCordFall(seed, { x, y });
    const initial = fall.paths();
    initial.forEach((piece, i) => {
      assert.ok(distance(piece[0], seed[i][0]) < .02);
      assert.ok(distance(piece.at(-1), seed[i].at(-1)) < .02);
    });
    const freeEnd = () => fall.paths()[0][0].y;
    const start = freeEnd();
    for (let frame = 0; frame < 18; frame++) fall.step(1 / 60);
    const early = freeEnd();
    for (let frame = 0; frame < 18; frame++) fall.step(1 / 60);
    assert.ok(freeEnd() - early > early - start, 'the rope should gain speed as it falls');

    let cleared = false;
    for (let frame = 36; frame < 120 && !cleared; frame++) {
      fall.step(1 / 60);
      const pieces = ropeSpines(fall.paths()).map(({ points }) => points);
      assertConnected(pieces);
      cleared = pieces.flat().every(({ y: height }) => height > 940);
    }
    assert.ok(cleared, 'even the top of the strand should drop below a tall viewport');
  }
});
