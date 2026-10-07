/* @layer renderer-components @kind logic */
/**
 * Where every hookshot sprite goes along its curve. Links hang pin to pin, each turned to
 * its own chord, alternating face-on and edge-on like a real chain. The handle's muzzle
 * sits on the curve's start and the head's back on its end, each turned along the curve.
 */
import { HOOKSHOT_PARTS } from '../Hookshot.constants';
import type { HookshotCurve, HookshotLayout, PlacedSprite, Point, SpriteName } from '../Hookshot.type';
import { pinChain } from './pin-chain';

const DEG = 180 / Math.PI;
const PITCH = HOOKSHOT_PARTS.linkFace.pinB[0] - HOOKSHOT_PARTS.linkFace.pinA[0];

const angleOf = (a: Point, b: Point): number => Math.atan2(b[1] - a[1], b[0] - a[0]) * DEG;
const turn = ([x, y]: Point, deg: number): Point => {
  const c = Math.cos(deg / DEG), s = Math.sin(deg / DEG);
  return [x * c - y * s, x * s + y * c];
};
const add = (a: Point, b: Point): Point => [a[0] + b[0], a[1] + b[1]];

/** A sprite turned by `angle` around its own `anchor`, with that anchor placed on `at`. */
const pinned = (sprite: SpriteName, anchor: Point, at: Point, angle: number): PlacedSprite => {
  const { w, h } = HOOKSHOT_PARTS[sprite];
  return { sprite, left: at[0] - anchor[0], top: at[1] - anchor[1], width: w, height: h, angle, originX: anchor[0], originY: anchor[1] };
};

const layoutHookshot = (curve: HookshotCurve): HookshotLayout => {
  const { handle, linkFace, linkEdge, head } = HOOKSHOT_PARTS;
  const pins = pinChain(curve, PITCH);
  const chords = pins.slice(1).map((b, i) => ({ from: pins[i], angle: angleOf(pins[i], b) }));
  const faces = chords.filter((_, i) => i % 2 === 0).map(({ from, angle }) => pinned('linkFace', linkFace.pinA, from, angle));
  const edges = chords.filter((_, i) => i % 2 === 1).map(({ from, angle }) => pinned('linkEdge', linkEdge.pinA, from, angle));
  const endAngle = angleOf(curve[2], curve[3]);
  return {
    links: [...faces, ...edges],
    handle: pinned('handle', handle.muzzle, curve[0], angleOf(curve[0], curve[1])),
    head: pinned('head', head.back, curve[3], endAngle),
    tip: add(curve[3], turn([head.tip[0] - head.back[0], head.tip[1] - head.back[1]], endAngle)),
  };
};

/**
 * The curve of a hookshot held by its grip at `grip` and fired at `angle` degrees. The chain
 * runs `length` pixels and its end has turned `bend` degrees further, in an even arc.
 */
const hookshotCurve = (grip: Point, angle: number, length: number, bend: number): HookshotCurve => {
  const { grip: g, muzzle: m } = HOOKSHOT_PARTS.handle;
  const start = add(grip, turn([m[0] - g[0], m[1] - g[1]], angle));
  const end = add(start, turn([length, 0], angle + bend / 2));
  return [start, add(start, turn([length / 3, 0], angle)), add(end, turn([-length / 3, 0], angle + bend)), end];
};

export { layoutHookshot, hookshotCurve };
