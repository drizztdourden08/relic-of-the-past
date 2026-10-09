/* @layer renderer-components @kind logic */
import { MASCOT_PARTS } from '../Mascot.constants';
import type { PieceName, PlacedPiece, PodAngles, Point } from '../Mascot.type';
import { LOOK_X, LOOK_Y } from './mascot-layout.constants';

const clamp = (v: number, limit: number) => Math.max(-limit, Math.min(limit, Math.round(v)));

const piece = (name: PieceName, [left, top]: Point, angle = 0, origin?: Point): PlacedPiece => {
  const { w, h } = MASCOT_PARTS[name];
  const [originX, originY] = origin ?? [w / 2, h / 2];
  return { piece: name, left, top, width: w, height: h, angle, originX, originY };
};

const layoutMascot = (look: Point = [0, 0], podAngles: PodAngles = {}): PlacedPiece[] => {
  const { body, visor, eye, podLeft, podRight } = MASCOT_PARTS;
  const lx = clamp(look[0], LOOK_X), ly = clamp(look[1], LOOK_Y);
  return [
    piece('podLeft', podLeft.at, podAngles.left ?? 0, podLeft.pivot),
    piece('podRight', podRight.at, podAngles.right ?? 0, podRight.pivot),
    piece('body', body.at),
    piece('visor', visor.at),
    ...eye.at.map(([x, y]) => piece('eye', [x + lx, y + ly])),
  ];
};

export { layoutMascot };
