/* @layer renderer-components @kind logic */
/**
 * Where a floating widget may sit: inside the game's rectangle, and never over
 * another floating widget. A wanted spot is clamped into the game, then pushed
 * off anything it overlaps by the shortest move that stays inside; when no
 * such move exists the placement is refused. Positions are kept as fractions
 * of the game rect, so they follow the game.
 */
import type { FloatingWidget, Rect, WidgetId } from '@shared/types/widget-layout';
import { GAP } from './layout-tree';

const overlaps = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

const inside = (r: Rect, game: Rect): boolean =>
  r.x >= game.x && r.y >= game.y && r.x + r.width <= game.x + game.width && r.y + r.height <= game.y + game.height;

const clampInto = (r: Rect, game: Rect): Rect => {
  const width = Math.min(r.width, game.width);
  const height = Math.min(r.height, game.height);
  return {
    x: Math.max(game.x, Math.min(r.x, game.x + game.width - width)),
    y: Math.max(game.y, Math.min(r.y, game.y + game.height - height)),
    width,
    height,
  };
};

const MAX_PUSHES = 6;

/** The nearest free rectangle for `wanted`, or null when the game holds no room for it. */
const placeFloating = (game: Rect, others: readonly Rect[], wanted: Rect): Rect | null => {
  let r = clampInto(wanted, game);
  for (let pass = 0; pass < MAX_PUSHES; pass++) {
    const hit = others.find((o) => overlaps(r, o));
    if (!hit) return r;
    const moves: [number, number][] = [
      [hit.x - r.width - GAP - r.x, 0],
      [hit.x + hit.width + GAP - r.x, 0],
      [0, hit.y - r.height - GAP - r.y],
      [0, hit.y + hit.height + GAP - r.y],
    ];
    moves.sort((a, b) => Math.hypot(a[0], a[1]) - Math.hypot(b[0], b[1]));
    const move = moves.find(([dx, dy]) => inside({ ...r, x: r.x + dx, y: r.y + dy }, game));
    if (!move) return null;
    r = { ...r, x: r.x + move[0], y: r.y + move[1] };
  }
  return others.some((o) => overlaps(r, o)) ? null : r;
};

/** A floating widget's pixels for the current game rect. */
const floatingRect = (f: FloatingWidget, game: Rect): Rect =>
  clampInto({ x: game.x + f.x * game.width, y: game.y + f.y * game.height, width: f.width, height: f.height }, game);

/** A rect inside the game, as the fractions the layout keeps. */
const toFloating = (id: WidgetId, rect: Rect, game: Rect): FloatingWidget => ({
  id,
  x: game.width > 0 ? (rect.x - game.x) / game.width : 0,
  y: game.height > 0 ? (rect.y - game.y) / game.height : 0,
  width: rect.width,
  height: rect.height,
});

export { floatingRect, overlaps, placeFloating, toFloating };
