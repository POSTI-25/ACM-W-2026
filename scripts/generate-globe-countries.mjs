import { writeFile } from 'node:fs/promises';

// Natural Earth country geometry distributed by world-atlas (ISC).
const source = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json';
const response = await fetch(source);
if (!response.ok) throw new Error(`World atlas download failed: ${response.status}`);
const topology = await response.json();
const { scale, translate } = topology.transform;
const arcs = topology.arcs.map(arc => {
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => {
    x += dx; y += dy;
    return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
  });
});
const ring = indexes => indexes.flatMap((index, i) => {
  const points = index < 0 ? [...arcs[~index]].reverse() : arcs[index];
  return i ? points.slice(1) : points;
});
const features = topology.objects.countries.geometries.map(geometry => ({
  type: 'Feature', id: String(geometry.id).padStart(3, '0'), properties: geometry.properties,
  geometry: { type: geometry.type, coordinates: geometry.type === 'Polygon'
    ? geometry.arcs.map(ring) : geometry.arcs.map(polygon => polygon.map(ring)) },
}));
for (const id of ['356', '616', '826', '040', '840']) {
  if (!features.some(feature => feature.id === id)) throw new Error(`Missing featured country ${id}`);
}
await writeFile(new URL('../src/assets/globe/countries-110m.geo.json', import.meta.url),
  JSON.stringify({ type: 'FeatureCollection', features }));
const license = await fetch('https://unpkg.com/world-atlas@2.0.2/LICENSE');
if (!license.ok) throw new Error('World atlas license download failed');
await writeFile(new URL('../public/licenses/world-atlas.txt', import.meta.url),
  `${await license.text()}\nCountry shapes: Natural Earth, public domain.\nSource: ${source}\n`);
console.log(`Saved ${features.length} country features with their original identifiers.`);
