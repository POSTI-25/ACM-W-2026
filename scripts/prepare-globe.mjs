import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
const require=createRequire(import.meta.url);
const world=JSON.parse(await readFile(require.resolve('world-atlas/countries-110m.json'),'utf8'));
const points=[];
const vertex=([longitude,latitude])=>{
  const phi=(90-latitude)*Math.PI/180,theta=(longitude+180)*Math.PI/180;
  return [-1.002*Math.sin(phi)*Math.cos(theta),1.002*Math.cos(phi),1.002*Math.sin(phi)*Math.sin(theta)].map(x=>Number(x.toFixed(5)));
};
for(const country of feature(world,world.objects.countries).features){
  const polygons=country.geometry.type==='Polygon'?[country.geometry.coordinates]:country.geometry.coordinates;
  for(const polygon of polygons) for(const ring of polygon) for(let i=0;i<ring.length-1;i++) points.push(...vertex(ring[i]),...vertex(ring[i+1]));
}
await writeFile('src/assets/optimized/world-borders.json',JSON.stringify(points)+'\n');
console.log('Prepared local globe borders; no runtime CDN scripts required.');
