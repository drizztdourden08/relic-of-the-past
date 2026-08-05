/* @layer shared-game @kind data */
/**
 * ROM-derived tile-attribute groupings used by cliff/ledge navigation.
 *
 * Consolidates the raw attribute-byte sets that used to be hardcoded three
 * separate times: `screen-data/cliff-preprocessing.ts`, `screen-data/indoor-
 * ledge-dirs.ts`, and the navigation overlay's `draw/draw-dots.ts`. This file
 * only gathers the byte sets under one roof — it does not change which
 * consumer reads which set, or how; that rewiring is separate follow-up work.
 *
 * Most of these values are transcribed straight from the ROM's own
 * tile-attribute encoding, but two of them are OUR interpretation, not the
 * engine's own equivalence classes. The engine
 * (`core/zelda3/src/tile_detect.c:313-321`) groups 0x10-0x13 as one `Slope`
 * case and 0x18-0x1B as one `SlopeOuter` case — it does not distinguish a
 * cliff's face from its edge within either run. This project deliberately
 * re-cuts those same four-byte runs into two conceptual buckets:
 *   - "cliff-face"      : 0x10, 0x12, 0x18, 0x1a
 *   - "cliff-edge/slope" : 0x11, 0x13, 0x19, 0x1b
 * because the cliff preprocessor needs the face/edge distinction to
 * synthesise ledges (a face extends a ledge run when Link jumps into it; an
 * edge does not). No single export below uses either full four-byte bucket —
 * each original call site historically picked whatever subset it needed, and
 * those subsets disagree with one another. See the consolidation report for
 * the discrepancy table; nothing here has been unified or "corrected" — every
 * set is preserved byte-for-byte from its original call site.
 */

/** Direction a straight cliff-trigger jump moves in, plus its row/col delta. */
interface CliffDir {
  dr: number;
  dc: number;
  dir: 'n' | 's' | 'e' | 'w';
}

/**
 * Straight-jump trigger attrs (`cliff-preprocessing.ts` `processStraightCliffs`,
 * local `CLIFF_TRIGGERS`). Diagonal triggers 0x2c-0x2f are a separate set
 * (see `VERTICAL_CLIFF_DIRS`) — they run through `processDiagonalCliffs`, not this one.
 */
const CLIFF_TRIGGERS = new Set([0x28, 0x29, 0x2a, 0x2b]);

/**
 * Indoor fixed jump direction (`cliff-preprocessing.ts` local `CLIFF_DIRS`,
 * `isIndoors` branch). Indoors, only 0x2f has a hardcoded direction — 0x28/
 * 0x29/0x2a/0x2b are resolved per-tile instead, by `computeIndoorLedgeDirs`
 * (see `HORIZ_LEDGE_ATTRS` / `VERT_LEDGE_ATTRS` below).
 */
const CLIFF_DIRS_INDOOR: Record<number, CliffDir> = {
  0x2f: { dr: 0, dc: -1, dir: 'w' },
};

/**
 * Outdoor fixed jump direction (`cliff-preprocessing.ts` local `CLIFF_DIRS`,
 * outdoors branch). Outdoors all four straight triggers have one fixed
 * direction apiece — no per-tile inference needed.
 */
const CLIFF_DIRS_OUTDOOR: Record<number, CliffDir> = {
  0x28: { dr: -1, dc: 0, dir: 'n' },
  0x29: { dr: 1, dc: 0, dir: 's' },
  0x2a: { dr: 0, dc: -1, dir: 'w' },
  0x2b: { dr: 0, dc: 1, dir: 'e' },
};

/**
 * Indoor "wall" set used both to stop a ledge run and to infer indoor jump
 * direction (`cliff-preprocessing.ts` local `CLIFF_WALL`, `isIndoors` branch).
 * Includes 0x04 — thick grass is walkable outdoors but a wall indoors — which
 * `CLIFF_WALL_OUTDOOR` below does not.
 */
const CLIFF_WALL_INDOOR = new Set([0x01, 0x02, 0x03, 0x04, 0x1a, 0x12, 0x13, 0x1b]);

/**
 * Outdoor "wall" set (`cliff-preprocessing.ts` local `CLIFF_WALL`, outdoors
 * branch). Same as `CLIFF_WALL_INDOOR` minus 0x04.
 */
const CLIFF_WALL_OUTDOOR = new Set([0x01, 0x02, 0x03, 0x1a, 0x12, 0x13, 0x1b]);

/**
 * Diagonal-edge attrs that would seed a south cliff run
 * (`cliff-preprocessing.ts` `processSouthCliffs`, local `DIAG_EDGE_ATTRS`).
 * Empty in the current source — diagonal cliffs are handled entirely by
 * `processDiagonalCliffs` and intentionally never seed a south run — but kept
 * as its own named export rather than inlined, since that is how the
 * original reads and the emptiness is itself load-bearing (see the comment
 * at its call site about re-emitted diagonal tiles).
 */
const DIAG_EDGE_ATTRS = new Set<number>();

/**
 * Cliff-face bytes that seed a south run (`cliff-preprocessing.ts`
 * `processSouthCliffs`, local `CLIFF_BORDER_ATTRS`). Only the SOUTH/EAST face
 * bytes (0x10, 0x18) — not the full four-byte "cliff-face" bucket described
 * above, and not the NORTH/WEST face bytes 0x12/0x1a that `CLIFF_WALL_*`
 * carries instead.
 */
const CLIFF_BORDER_ATTRS = new Set([0x10, 0x18]);

/**
 * Vertical half of a diagonal cliff hop, keyed by trigger attr
 * (`cliff-preprocessing.ts` `processDiagonalCliffs`, local `VERTICAL`).
 * The tile alone decides north vs. south; which side (NE/NW/SE/SW) resolves
 * from the approach direction at runtime, not from this table.
 */
const VERTICAL_CLIFF_DIRS: Record<number, -1 | 1> = { 0x2c: -1, 0x2e: -1, 0x2d: 1, 0x2f: 1 };

/**
 * Indoor horizontal-jump trigger attrs (`indoor-ledge-dirs.ts`
 * `HORIZ_LEDGE_ATTRS`) — same two bytes as half of `CLIFF_TRIGGERS`, exported
 * separately there because `computeIndoorLedgeDirs` needs to test horizontal
 * vs. vertical triggers on their own.
 */
const HORIZ_LEDGE_ATTRS = new Set([0x2a, 0x2b]);

/**
 * Indoor vertical-jump trigger attrs (`indoor-ledge-dirs.ts`
 * `VERT_LEDGE_ATTRS`) — the other half of `CLIFF_TRIGGERS`.
 */
const VERT_LEDGE_ATTRS = new Set([0x28, 0x29]);

/**
 * Ledge/cliff/wall attrs the navigation overlay skips when drawing reachable
 * dots (`draw-dots.ts` local `LEDGE_ATTRS`). This is a DIFFERENT, BROADER set
 * than `CLIFF_TRIGGERS` above — do not treat them as the same concept. It
 * covers all four straight triggers, all four diagonal triggers, the wall set
 * (0x01-0x03, plus 0x12/0x1a face and 0x13/0x1b edge bytes, matching
 * `CLIFF_WALL_OUTDOOR` exactly), PLUS 0x11 and 0x19 — the other two
 * "cliff-edge/slope" bytes that no `CLIFF_WALL_*` variant includes — PLUS
 * 0x3d, which appears nowhere else in any of the three original files and
 * whose meaning here is unexplained (flagged, not resolved, by this
 * consolidation).
 */
const DRAW_DOTS_LEDGE_ATTRS = new Set([
  0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f,
  0x01, 0x02, 0x03, 0x1a, 0x12, 0x11, 0x13, 0x19, 0x1b,
  0x3d,
]);

export {
  CLIFF_TRIGGERS,
  CLIFF_DIRS_INDOOR,
  CLIFF_DIRS_OUTDOOR,
  CLIFF_WALL_INDOOR,
  CLIFF_WALL_OUTDOOR,
  DIAG_EDGE_ATTRS,
  CLIFF_BORDER_ATTRS,
  VERTICAL_CLIFF_DIRS,
  HORIZ_LEDGE_ATTRS,
  VERT_LEDGE_ATTRS,
  DRAW_DOTS_LEDGE_ATTRS,
};
export type { CliffDir };
