/* @layer tooling-scripts @kind logic */
/**
 * Builds the document icon for `.msul` music packs: the app logo with a music-note badge in
 * the corner, so a pack file reads as "this app's music" at a glance in a file manager.
 *
 * Generated at build time from the committed logo rather than checked in, the same way the
 * launcher icons are, so a logo change never leaves a stale derived icon behind.
 *
 * Run: node scripts/build/make-msul-icon.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE = join(root, 'apps', 'web', 'public', 'logos', 'logo-512.png');
const OUT_DIR = join(root, 'apps', 'web', 'public', 'logos', 'generated');

// Windows .ico wants the whole ladder; the small sizes are what actually show in a file list.
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];

/** A music note, drawn rather than shipped as an asset so there is nothing extra to keep in sync. */
const badgeSvg = (size) => {
  const stroke = Math.max(2, Math.round(size * 0.055));
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="#12100e" stroke="#e8a33d" stroke-width="${stroke}"/>
    <g fill="#e8a33d">
      <ellipse cx="36" cy="68" rx="13" ry="10" transform="rotate(-20 36 68)"/>
      <rect x="45" y="26" width="7" height="44" rx="3"/>
      <path d="M45 26 L74 18 L74 33 L45 41 Z"/>
    </g>
  </svg>`);
};

/** Logo scaled into a square canvas with the badge overlaid bottom-right. */
const compose = async (size) => {
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

const main = async () => {
  await mkdir(OUT_DIR, { recursive: true });

  const pngs = [];
  for (const size of ICO_SIZES) {
    const buffer = await compose(size);
    pngs.push(buffer);
    if (size === 256) await writeFile(join(OUT_DIR, 'msul-256.png'), buffer);
  }
  await writeFile(join(OUT_DIR, 'msul-512.png'), await compose(512));
  await writeFile(join(OUT_DIR, 'msul.ico'), await pngToIco(pngs));

  console.log(`[msul-icon] wrote msul.ico, msul-256.png, msul-512.png to ${OUT_DIR}`);
};

main().catch((err) => {
  console.error(`[msul-icon] failed: ${err.message}`);
  process.exit(1);
});
