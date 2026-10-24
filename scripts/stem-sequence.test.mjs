import test from 'node:test';
import assert from 'node:assert/strict';
import { countrySpin, stemSceneAt, STEM_PHASE as P } from '../src/lib/stemSequence.ts';

const countries = [[79,22],[20,52],[-2,54],[14,47.5],[-98,39]];

test('every featured country gets a full revolution even when neighbours share a region', () => {
  let previous = -1.6;
  for (const [lng,lat] of countries) {
    const spin = countrySpin(lng,lat,previous);
    assert.equal(spin.fromY, previous);
    assert.ok(Math.abs(spin.toY-spin.fromY)>=Math.PI*2-1e-12);
    assert.ok(Math.abs(spin.toY-spin.fromY)<=Math.PI*3+1e-12);
    previous = spin.toY;
  }
});
test('the landed country faces the camera after longitude then latitude rotation', () => {
  let previous = -1.6;
  for (const [lng,lat] of countries) {
    const {toY,tilt} = countrySpin(lng,lat,previous);
    previous = toY;
    const longitude=lng*Math.PI/180, latitude=lat*Math.PI/180;
    const x=Math.cos(latitude)*Math.cos(longitude), y=Math.sin(latitude), z=-Math.cos(latitude)*Math.sin(longitude);
    const turnedX=Math.cos(toY)*x+Math.sin(toY)*z;
    const turnedZ=-Math.sin(toY)*x+Math.cos(toY)*z;
    const centredY=Math.cos(tilt)*y-Math.sin(tilt)*turnedZ;
    const frontZ=Math.sin(tilt)*y+Math.cos(tilt)*turnedZ;
    assert.ok(Math.abs(turnedX)<1e-12 && Math.abs(centredY)<1e-12 && frontZ>.999999);
  }
});
test('highlight, map, portrait, hold, and exit follow the full spin in order', () => {
  assert.ok(P.enterEnd<P.spinEnd && P.spinEnd<P.highlightEnd && P.highlightEnd<P.mapEnd);
  assert.ok(P.mapEnd<P.portraitEnd && P.portraitEnd<P.holdEnd && P.holdEnd<P.exitEnd);
});
test('forward and reverse chapter boundaries select the correct scientist', () => {
  assert.deepEqual(stemSceneAt(1,5),{index:1,progress:0});
  assert.equal(stemSceneAt(.999,5).index,0);
  assert.deepEqual(stemSceneAt(5,5),{index:4,progress:1});
  assert.deepEqual(stemSceneAt(-1,5),{index:0,progress:0});
});
