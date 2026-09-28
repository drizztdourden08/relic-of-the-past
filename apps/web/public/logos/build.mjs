/* @layer tooling-scripts @kind logic */
/**
 * Builds every logo file from its source. Each piece lives in its own folder here:
 *
 *   logo/      the app logo: logo.svg is the hand-drawn source, the rest is built from it
 *   sentri/    the mascot at rest, composed from apps/web/src/assets/mascot by the app's own layout, and its .ico
 *   hookshop/  the Hookshop highlight, composed the same way from assets/hookshop
 *
 * The app's small icon set, the Windows icon, the site favicons and the transparent renders
 * all come out of one run, so a redrawn piece never leaves a stale file behind.
 *
 *   node apps/web/public/logos/build.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { openLayouts, sentriSvg, highlightSvg } from './build/compose.mjs';
import { crisp, ico, icon } from './build/raster.mjs';

const HERE = import.meta.dirname;
const ROOT = resolve(HERE, '..', '..', '..', '..');

/** The square sizes the app, the OS and the browser ask for. */
const ICON_SIZES = [16, 24, 32, 48, 64, 128, 256, 512];
/** What goes into the Windows .ico; 512 is more than the shell ever shows. */
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];
/** The sites take the logo as their favicon and brand mark. */
const SITE_PUBLIC = ['apps/sanctuary/public', 'apps/store/public'];
const SITE_SIZES = [32, 128];
/** Where the Hookshop highlight reads the bag's stamp from. */
const STAMP = 'apps/web/src/assets/hookshop/hookshop-stamp.svg';
/** Transparent renders of the composed pieces, at whole-pixel scales. */
const RENDER_SCALES = [1, 2, 4];
const TRIMMED_SCALE = 8;

const out = (folder, name, data) => {
  const dir = resolve(HERE, folder);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, name), data);
  return `${folder}/${name}`;
};

const buildLadder = async (folder, stem, svg) => {
  const written = [];
  for (const size of ICON_SIZES) written.push(out(folder, `${stem}-${size}.png`, await icon(svg, size)));
  return written;
};

const buildLogo = async () => {
  const svg = readFileSync(resolve(HERE, 'logo/logo.svg'), 'utf8');
  const written = await buildLadder('logo', 'logo', svg);
  written.push(out('logo', 'logo.ico', await ico(svg, ICO_SIZES)));
  // the bag's stamp is the logo at the bag's own pixel size; the sites bundle it, so it is a copy
  writeFileSync(resolve(ROOT, STAMP), svg.replace(/<!--[\s\S]*?-->\s*/, '<!-- The logo, copied from apps/web/public/logos/logo/logo.svg by npm run logos: the stamp on the Hookshop bag. -->\n'));
  written.push(STAMP);
  for (const site of SITE_PUBLIC) {
    for (const size of SITE_SIZES) {
      writeFileSync(resolve(ROOT, site, `logo-${size}.png`), await icon(svg, size));
      written.push(`${site}/logo-${size}.png`);
    }
  }
  return written;
};

const buildSentri = async (layouts) => {
  const svg = sentriSvg(layouts);
  const written = [out('sentri', 'sentri.svg', svg), ...await buildLadder('sentri', 'sentri', svg)];
  written.push(out('sentri', 'sentri.ico', await ico(svg, ICO_SIZES)));
  written.push(out('sentri', 'sentri-trimmed.png', await crisp(svg, TRIMMED_SCALE)));
  return { svg, written };
};

const buildHighlight = async (layouts, sentri) => {
  const svg = highlightSvg(layouts, sentri);
  const written = [out('hookshop', 'highlight.svg', svg)];
  for (const scale of RENDER_SCALES) written.push(out('hookshop', `highlight-${scale}x.png`, await crisp(svg, scale)));
  return written;
};

const layouts = await openLayouts();
try {
  const logo = await buildLogo();
  const sentri = await buildSentri(layouts);
  const highlight = await buildHighlight(layouts, sentri.svg);
  for (const file of [...logo, ...sentri.written, ...highlight]) console.log(`  ${file}`);
} finally {
  await layouts.close();
}
