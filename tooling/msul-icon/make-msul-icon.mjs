/* @layer tooling-scripts @kind logic */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE = join(root, 'apps', 'desktop', 'public', 'logos', 'logo', 'logo-512.png');
const OUT_DIR = join(root, 'apps', 'desktop', 'build');

const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];

const ICNS_SLOTS = [
  ['ic11', 32], ['ic12', 64], ['ic07', 128],
  ['ic13', 256], ['ic08', 256], ['ic14', 512], ['ic09', 512],
];

const ICNS_HEADER_BYTES = 8;

const chunkOf = (type, data) => {
  const header = Buffer.alloc(ICNS_HEADER_BYTES);
  header.write(type, 0, 4, 'ascii');
  header.writeUInt32BE(data.length + ICNS_HEADER_BYTES, 4);
  return Buffer.concat([header, data]);
};

const buildIcns = (entries) => chunkOf('icns', Buffer.concat(entries.map(([type, png]) => chunkOf(type, png))));

const LUCIDE_MUSIC = '<!-- Lucide music icon, ISC licence, lucide.dev --><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>';

const badgeSvg = (size) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="42" fill="#12100e" stroke="#e8a33d" stroke-width="5"/>
    <g transform="translate(23 23) scale(2.25)" fill="none" stroke="#e8a33d" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">${LUCIDE_MUSIC}</g>
  </svg>`);

const composeLogoWithBadge = async (size) => {
  const badge = Math.round(size * 0.52);
  const logo = await sharp(SOURCE)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const badgePng = await sharp(badgeSvg(badge)).png().toBuffer();
  return sharp(logo)
    .composite([{ input: badgePng, gravity: 'southeast' }])
    .png()
    .toBuffer();
};

const writeIco = async () => {
  const pngs = [];
  for (const size of ICO_SIZES) pngs.push(await composeLogoWithBadge(size));
  await writeFile(join(OUT_DIR, 'msul.ico'), await pngToIco(pngs));
};

const writeIcns = async () => {
  const bySize = new Map();
  for (const [, size] of ICNS_SLOTS) {
    if (!bySize.has(size)) bySize.set(size, await composeLogoWithBadge(size));
  }
  await writeFile(join(OUT_DIR, 'msul.icns'), buildIcns(ICNS_SLOTS.map(([type, size]) => [type, bySize.get(size)])));
};

const main = async () => {
  await mkdir(OUT_DIR, { recursive: true });
  await writeIco();
  await writeIcns();
  console.log(`[msul-icon] wrote msul.ico and msul.icns to ${OUT_DIR}`);
};

main().catch((err) => {
  console.error(`[msul-icon] failed: ${err.message}`);
  process.exit(1);
});
