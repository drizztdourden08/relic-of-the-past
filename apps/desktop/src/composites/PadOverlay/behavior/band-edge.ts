/* @layer renderer-components @kind logic */
import type { EdgeBand, LabelSide, PlacedPart, Point } from '../PadOverlay.type';

const crossings = (a: Point, b: Point, top: number, bottom: number): number[] => {
  const xs = [a, b].filter((point) => point.y >= top && point.y <= bottom).map((point) => point.x);
  for (const line of [top, bottom]) {
    if ((a.y - line) * (b.y - line) < 0) xs.push(a.x + ((line - a.y) / (b.y - a.y)) * (b.x - a.x));
  }
  return xs;
};

const bandEdge = (outline: readonly Point[], parts: readonly PlacedPart[], band: EdgeBand, side: LabelSide): number => {
  const { y, half, own } = band;
  const top = y - half;
  const bottom = y + half;
  const sign = side === 'left' ? -1 : 1;
  const xs = [own.x + sign * own.radius];
  outline.forEach((point, index) => xs.push(...crossings(point, outline[(index + 1) % outline.length] ?? point, top, bottom)));
  parts.filter((part) => Math.abs(part.y - y) < part.radius + half).forEach((part) => xs.push(part.x + sign * part.radius));
  return side === 'left' ? Math.min(...xs) : Math.max(...xs);
};

export { bandEdge };
