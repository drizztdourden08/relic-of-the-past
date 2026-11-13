/* @layer renderer-app @kind logic */
import type { TouchViewState } from '../TouchControls.type';

type Point = { x: number; y: number };

const samePoint = (a: Point, b: Point): boolean =>
  Math.round(a.x) === Math.round(b.x) && Math.round(a.y) === Math.round(b.y);

const sameSet = (a: ReadonlySet<string>, b: ReadonlySet<string>): boolean =>
  a.size === b.size && [...a].every((id) => b.has(id));

const sameView = (a: TouchViewState, b: TouchViewState): boolean => {
  if (!sameSet(a.pressed, b.pressed)) return false;
  if (a.dpad.up !== b.dpad.up || a.dpad.down !== b.dpad.down) return false;
  if (a.dpad.left !== b.dpad.left || a.dpad.right !== b.dpad.right) return false;
  if (a.stick === null || b.stick === null) return a.stick === b.stick;
  return samePoint(a.stick.base, b.stick.base) && samePoint(a.stick.knob, b.stick.knob);
};

export { sameView };
