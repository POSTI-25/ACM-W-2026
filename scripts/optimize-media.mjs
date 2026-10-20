import sharp from 'sharp';
import { readdir, mkdir, stat } from 'node:fs/promises';
import { resolve, basename } from 'node:path';

const root = resolve('src/assets');
const out = resolve(root, 'optimized');
await mkdir(out, { recursive: true });
const jobs = [
  ['about/about-acm-w.svg', 'about-acm-w.webp', 1440],
  ['about/about-acm-vit.svg', 'about-acm-vit.webp', 1440],
  ...['ada', 'kaplana', 'curie', 'hedy', 'margaret'].map(name => [name + '.png', name + '.webp', 800]),
  ['footer/openEnvelope.png', 'open-envelope.webp', 700],
  ['blogImage.png', 'blog-cover.webp', 700],
];
for (const folder of ['teams', 'contributors']) {
  for (const name of await readdir(resolve(root, folder))) {
    if (/\.png$/i.test(name)) jobs.push([folder + '/' + name, folder + '-' + basename(name, '.png') + '.webp', 600]);
  }
}
let galleryIndex = 0;
for (const name of (await readdir(resolve(root, 'gallery'))).filter(name => /\.(jpg|jpeg|png|webp)$/i.test(name)).sort((a,b) => a.localeCompare(b, undefined, {numeric:true}))) {
  jobs.push(['gallery/' + name, 'gallery-' + (++galleryIndex) + '.webp', 1100]);
}
let before = 0, after = 0;
for (const [source, name, width] of jobs) {
  const input = resolve(root, source), output = resolve(out, name);
  console.log('Preparing ' + source);
  await sharp(input, {limitInputPixels: 100_000_000, failOn: 'none'}).rotate().resize({width, withoutEnlargement:true}).webp({quality:82, effort:5}).toFile(output);
  before += (await stat(input)).size;
  after += (await stat(output)).size;
}
console.log(`Optimized ${jobs.length} images: ${(before/1e6).toFixed(1)} MB → ${(after/1e6).toFixed(1)} MB. Originals retained.`);
