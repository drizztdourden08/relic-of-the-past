/* @layer tooling-scripts @kind logic */
/**
 * The composed pieces, drawn by the same layout code the app runs: Sentri at rest from the
 * mascot's pieces, and the Hookshop highlight from Sentri, the hookshot and the bag. The
 * layout modules are TypeScript with the app's path aliases, so they are loaded through
 * Vite rather than copied here. Each returns one SVG that places the piece SVGs.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createServer } from 'vite';

const WEB = resolve(import.meta.dirname, '..', '..', '..');
const ROOT = resolve(WEB, '..', '..');
const SRC = resolve(WEB, 'src');

const ALIAS = {
  '@shared': resolve(ROOT, 'shared'),
  '@app': SRC,
  '@ds': resolve(SRC, 'ui/design-system'),
  '@domains': resolve(SRC, 'ui/domains'),
};

const inner = (file) => readFileSync(file, 'utf8').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const viewBox = (file) => readFileSync(file, 'utf8').match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number);

/** One placed part: its SVG scaled into its box and turned around its origin, like the CSS does. */
const place = (file, p) => {
  const [w, h] = viewBox(file);
  return `<g transform="translate(${p.left} ${p.top}) rotate(${p.angle} ${p.originX} ${p.originY})">`
    + `<svg width="${p.width}" height="${p.height}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" shape-rendering="crispEdges" overflow="visible">${inner(file)}</svg></g>`;
};

const wrap = (body, w, h) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" shape-rendering="crispEdges">${body}</svg>\n`;

const MASCOT = resolve(SRC, 'assets/mascot');
const HOOKSHOP = resolve(SRC, 'assets/hookshop');
const MASCOT_FILES = {
  body: 'mascot-body.svg', visor: 'mascot-visor.svg', eye: 'mascot-eye.svg', podLeft: 'mascot-pod-left.svg', podRight: 'mascot-pod-right.svg',
};
const HOOKSHOP_FILES = {
  bag: 'hookshop-bag.svg', stamp: 'hookshop-stamp.svg', sparkle: 'hookshop-sparkle.svg', star: 'hookshop-star.svg', speedLine: 'hookshop-speed-line.svg',
  handle: 'hookshot-handle.svg', linkFace: 'hookshot-link-face.svg', linkEdge: 'hookshot-link-edge.svg', head: 'hookshot-head.svg',
};

/** Loads the app's layout modules; call `close` when done or the process stays up. */
const openLayouts = async () => {
  const server = await createServer({
    configFile: false, root: SRC, logLevel: 'silent', appType: 'custom',
    resolve: { alias: ALIAS }, esbuild: { jsx: 'automatic' },
    server: { middlewareMode: true, watch: null, hmr: false },
  });
  const load = (path) => server.ssrLoadModule(`/ui/domains/app/compounds/${path}`);
  const [mascot, mascotParts, scene, sceneParts, hookshot] = await Promise.all([
    load('Mascot/behavior/mascot-layout.ts'), load('Mascot/Mascot.constants.ts'),
    load('HookshopHighlight/behavior/scene-layout.ts'), load('HookshopHighlight/HookshopHighlight.constants.ts'),
    load('Hookshot/behavior/hookshot-layout.ts'),
  ]);
  return {
    close: () => server.close(),
    mascot: { layout: mascot.layoutMascot, parts: mascotParts.MASCOT_PARTS },
    scene: { layout: scene.computeLayout, parts: sceneParts.HOOKSHOP_PARTS, hookshot: hookshot.layoutHookshot },
  };
};

/** Sentri at rest: every piece where the app puts it, on the body's own grid. */
const sentriSvg = ({ mascot }) => {
  const pieces = mascot.layout();
  const { w, h } = mascot.parts.body;
  return wrap(pieces.map((p) => place(resolve(MASCOT, MASCOT_FILES[p.piece]), p)).join(''), w, h);
};

/** The Hookshop highlight: Sentri pulling the bag in, with the stars behind the bag and the head clipped at its front edge. */
const highlightSvg = (layouts, sentri) => {
  const { scene } = layouts;
  const L = scene.layout(scene.parts);
  const hs = scene.hookshot(L.hookshot);
  const file = (name) => resolve(HOOKSHOP, HOOKSHOP_FILES[name]);
  const bot = `<g transform="translate(${L.bot.left} ${L.bot.top}) rotate(${L.bot.angle} ${L.bot.originX} ${L.bot.originY})">${sentri.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')}</g>`;
  const bag = `<g transform="translate(${L.bag.left} ${L.bag.top}) rotate(${L.bag.angle} ${L.bag.originX} ${L.bag.originY})">`
    + place(file('bag'), { ...L.bag, left: 0, top: 0, angle: 0 }) + place(file('stamp'), L.stamp) + '</g>';
  const clip = `<clipPath id="head"><polygon points="${L.hookshotClip.map((p) => p.join(',')).join(' ')}"/></clipPath>`;
  const chain = `<g clip-path="url(#head)">${[...hs.links, hs.handle, hs.head].map((p) => place(file(p.sprite), p)).join('')}</g>`;
  const effects = (list) => list.map((e) => place(file(e.part), e)).join('');
  return wrap(clip + bot + effects(L.behindBag) + bag + chain + effects(L.effects), L.width, L.height);
};

export { openLayouts, sentriSvg, highlightSvg };
