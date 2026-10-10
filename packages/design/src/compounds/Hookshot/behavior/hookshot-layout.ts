/* @layer renderer-components @kind logic */
import { HOOKSHOT_PARTS } from '../Hookshot.constants';
import type { HookshotCurve, HookshotLayout, PlacedSprite, Point, SpriteName } from '../Hookshot.type';
import { addPoints } from './add-points';
import { DEG, PITCH } from './hookshot-layout.constants';
import { pinChain } from './pin-chain';
import { pointAt } from './point-at';
import { turnPoint } from './turn-point';

const angleOf = (a: Point, b: Point): number => Math.atan2(b[1] - a[1], b[0] - a[0]) * DEG;

const pinned = (sprite: SpriteName, anchor: Point, at: Point, angle: number): PlacedSprite => {
  const { w, h } = HOOKSHOT_PARTS[sprite];
  return { sprite, left: at[0] - anchor[0], top: at[1] - anchor[1], width: w, height: h, angle, originX: anchor[0], originY: anchor[1] };
};

const layoutHookshot = (curve: HookshotCurve): HookshotLayout => {
  const { handle, linkFace, linkEdge, head } = HOOKSHOT_PARTS;
  const pins = pinChain(curve, PITCH);
  const chords = pins.slice(1).map((b, i) => {
    const from = pointAt(pins, i);
    return { from, angle: angleOf(from, b) };
  });
  const faces = chords.filter((_, i) => i % 2 === 0).map(({ from, angle }) => pinned('linkFace', linkFace.pinA, from, angle));
  const edges = chords.filter((_, i) => i % 2 === 1).map(({ from, angle }) => pinned('linkEdge', linkEdge.pinA, from, angle));
  const endAngle = angleOf(curve[2], curve[3]);
  return {
    links: [...faces, ...edges],
    handle: pinned('handle', handle.muzzle, curve[0], angleOf(curve[0], curve[1])),
    head: pinned('head', head.back, curve[3], endAngle),
    tip: addPoints(curve[3], turnPoint([head.tip[0] - head.back[0], head.tip[1] - head.back[1]], endAngle)),
  };
};

export { layoutHookshot };
