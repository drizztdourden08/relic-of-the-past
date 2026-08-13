/* @layer tooling-scripts @kind logic */
/**
 * Builds the installer splash as an animated GIF, matching the app's boot splash
 * (apps/web/src/index.html) frame for frame: black ground, 192px mark, a 28px ring
 * whose top quarter is gold, one revolution every 0.7s.
 */
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { join } from 'path';

const require = createRequire('E:/GameProjects/relic-of-the-past/package.json');
const sharp = require('sharp');

const ROOT = process.cwd();
const OUT = process.argv[2] ?? join(ROOT, 'build', 'installer-splash.gif');

// Window, mirroring the splash-sized BrowserWindow in window/create-window.ts.
const W = 480;
const H = 360;

// From the boot splash CSS: 192px logo, 28px spinner, 28px gap, column centred.
const LOGO = 192;
const RING = 28;
const GAP = 28;
const STROKE = 3;
const TRACK = 'rgba(255,255,255,0.12)';
const GOLD = '#c8a84e';

const FRAMES = 14;          // 14 x 50ms = 700ms, the CSS animation duration
const DELAY_MS = 50;

const contentH = LOGO + GAP + RING;
const logoTop = Math.round((H - contentH) / 2);
const ringTop = logoTop + LOGO + GAP;
const ringLeft = Math.round((W - RING) / 2);

// The gold quarter, centred on twelve o'clock, drawn as an arc so it matches the
// CSS border-top-color trick rather than approximating it.
const arcPath = () => {
  const c = RING / 2;
  const r = (RING - STROKE) / 2;
  const at = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return [c + r * Math.cos(rad), c + r * Math.sin(rad)];
  };
  const [x1, y1] = at(-135);
  const [x2, y2] = at(-45);
  return `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 0 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`;
};

const ringSvg = (angle) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${RING}" height="${RING}">
  <g transform="rotate(${angle} ${RING / 2} ${RING / 2})">
    <circle cx="${RING / 2}" cy="${RING / 2}" r="${(RING - STROKE) / 2}"
            fill="none" stroke="${TRACK}" stroke-width="${STROKE}" />
    <path d="${arcPath()}" fill="none" stroke="${GOLD}" stroke-width="${STROKE}"
          stroke-linecap="butt" />
  </g>
</svg>`;

const logo = await sharp(join(ROOT, 'apps/web/public/logos/logo-256.png'))
  .resize(LOGO, LOGO, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const frames = [];
for (let i = 0; i < FRAMES; i += 1) {
  const angle = (360 / FRAMES) * i;
  const ring = await sharp(Buffer.from(ringSvg(angle))).png().toBuffer();
  const frame = await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  })
    .composite([
      { input: logo, top: logoTop, left: Math.round((W - LOGO) / 2) },
      { input: ring, top: ringTop, left: ringLeft },
    ])
    .raw()
    .toBuffer();
  frames.push(frame);
}

// Animated output takes its frames stacked vertically, one page each.
const stacked = Buffer.concat(frames);
await sharp(stacked, {
  raw: { width: W, height: H * FRAMES, channels: 4, pageHeight: H },
})
    // Full palette and no dithering: the mark is a smooth gold gradient, and dither
  // turns that into speckle. Zero interframe error keeps the ring crisp per frame.
  .gif({
    loop: 0,
    delay: new Array(FRAMES).fill(DELAY_MS),
    colours: 256,
    dither: 0,
    interFrameMaxError: 0,
    interPaletteMaxError: 0,
    effort: 10,
  })
  .toFile(OUT);

const meta = await sharp(OUT, { animated: true }).metadata();
console.log(`wrote ${OUT}`);
console.log(`  ${meta.width}x${meta.pageHeight} · ${meta.pages} frames · ${DELAY_MS}ms each`);
