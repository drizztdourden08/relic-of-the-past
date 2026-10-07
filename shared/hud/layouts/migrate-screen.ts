/* @layer shared-hud @kind logic */
/**
 * The §42 rewrite, run ONCE on load, on the raw untrusted value, before
 * `validateLayout` ever sees it - the same expand-and-forget discipline §26
 * gave the four opaque element kinds. No alias survives: `regions` and
 * `direction: 'stack'` do not keep working under a deprecated name, because an
 * alias is exactly how a project ends up with two ways to say one thing
 * forever. A document stored in the old shape opens correctly and is SAVED in
 * the new one.
 *
 * TWO REWRITES, ONE IDEA: everything is a grid.
 *
 *  1. A `stack` container - all children at one origin - becomes a ONE-CELL
 *     grid with every child explicitly at (1,1). That is what an overlay is,
 *     and the grid engine already drew it; `stack` was the flex engine
 *     carrying a second, incompatible layout mode it had no name for.
 *     `justify`/`align` become `justifyItems`/`alignItems`, which is where
 *     `place-flow.ts`'s own stack branch read them from anyway. A `between`
 *     justify becomes `start`: there is nothing to distribute at one origin,
 *     and `start` is what that branch already did with it.
 *
 *  2. `regions[]` becomes `screen.children`. The nine anchors were a 3x3 grid
 *     wearing words, so the screen becomes a grid whose default template is
 *     `[auto, fill, auto]` each way - the middle track eats the free space, so
 *     the outer bands are exactly as wide as their contents and hug the edges.
 *     Each region becomes an ordinary child with a `place` and the alignment
 *     its anchor's two bands imply.
 *
 * A THIRD REWRITE RIDES ALONG, because it is the same walk of the same raw
 * tree: a flex container's single `gap` becomes the `{ x, y }` pair both
 * engines take since §57. Its own reasoning is in `migrate-gap.ts`.
 *
 * WHY ALIGNMENT IS PER-CHILD AND NOT ONLY A ROOT DEFAULT. A grid's items
 * stretch unless told otherwise, and a stretched corner child is spread across
 * its whole band instead of hugging the corner. The root default says the
 * useful half - `justifyItems`/`alignItems: 'start'`, so a child dropped into
 * the screen later hugs its cell instead of smearing across it - but it can
 * only say one thing, and the nine anchors need three per axis. So the band's
 * own word is written onto the child: `alignSelf` (which speaks for both axes)
 * when the block band is not `start`, and `justifySelf` beside it whenever the
 * inline band then disagrees with what `alignSelf` just said for it.
 */

import { gapPatch } from './migrate-gap';

type Band = 'start' | 'center' | 'end';
type Raw = Record<string, unknown>;

const isRecord = (value: unknown): value is Raw =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** The nine anchors, decomposed into two bands each: `top-left` is start
 *  across and start down, `bottom-right` is end/end, `center` is center/center.
 *  `cellFor` below turns a band pair into a cell (and a span). */
const BANDS: Record<string, { x: Band; y: Band }> = {
  'top-left': { x: 'start', y: 'start' },
  'top-center': { x: 'center', y: 'start' },
  'top-right': { x: 'end', y: 'start' },
  'mid-left': { x: 'start', y: 'center' },
  center: { x: 'center', y: 'center' },
  'mid-right': { x: 'end', y: 'center' },
  'bottom-left': { x: 'start', y: 'end' },
  'bottom-center': { x: 'center', y: 'end' },
  'bottom-right': { x: 'end', y: 'end' },
};

const INDEX: Record<Band, number> = { start: 1, center: 2, end: 3 };

/** The smallest document that draws right: absent means the root's own
 *  `start`, so only a band that departs from it is written down. */
const alignmentFor = (band: { x: Band; y: Band }): Raw => {
  const alignSelf = band.y === 'start' ? undefined : band.y;
  return {
    ...(alignSelf ? { alignSelf } : {}),
    ...(band.x === (alignSelf ?? 'start') ? {} : { justifySelf: band.x }),
  };
};

const ITEMS: Record<string, string> = { start: 'start', center: 'center', end: 'end', between: 'start' };

/** One node, still raw JSON, with every `stack` under it turned into a grid.
 *
 *  A stack IGNORED `place`, so a co-placed child is pinned to (1,1) outright
 *  and not merged with whatever stale cell it was carrying; and a
 *  `stretch` `alignSelf` - which a stack read as `start` and a grid reads as
 *  "fill the cell" - is rewritten to the word it actually meant. */
const migrateNode = (value: unknown): unknown => {
  if (!isRecord(value)) return value;

  if (value.kind === 'element') {
    const element = isRecord(value.element) ? value.element : undefined;
    if (!element) return value;
    if (element.type === 'repeat') return { ...value, element: { ...element, child: migrateNode(element.child) } };
    if (element.type !== 'switch') return value;
    const cases = Array.isArray(element.cases)
      ? element.cases.map((c) => (isRecord(c) ? { ...c, node: migrateNode(c.node) } : c))
      : element.cases;
    const otherwise = element.otherwise === undefined ? {} : { otherwise: migrateNode(element.otherwise) };
    return { ...value, element: { ...element, cases, ...otherwise } };
  }

  if (value.kind !== 'container') return value;
  const children = (Array.isArray(value.children) ? value.children : []).map(migrateNode);
  // A flex `gap: n` becomes `{ x: n, y: n }` on the way past (§57,
  // `migrate-gap.ts`); a stack drops its gap below, as it always did.
  if (value.direction !== 'stack') return { ...value, ...gapPatch(value), children };

  const { direction: _d, justify, align, gap: _g, wrap: _w, ...box } = value;
  return {
    ...box,
    layout: 'grid',
    columns: ['auto'],
    rows: ['auto'],
    justifyItems: ITEMS[String(justify ?? 'start')] ?? 'start',
    alignItems: ITEMS[String(align ?? 'start')] ?? 'start',
    children: children.map((child) => (isRecord(child)
      ? {
        ...child,
        ...(child.alignSelf === 'stretch' ? { alignSelf: 'start' } : {}),
        place: { column: 1, row: 1 },
      }
      : child)),
  };
};

/** The three-band template every anchor was a cell of. */
const SCREEN_GRID = {
  layout: 'grid',
  columns: ['auto', 'fill', 'auto'],
  rows: ['auto', 'fill', 'auto'],
  justifyItems: 'start',
  alignItems: 'start',
};

/**
 * A CENTRED BAND SPANS ALL THREE TRACKS ON THAT AXIS, and that is what makes
 * the migration exact, not just close. `anchorRect` centred a region
 * in the WHOLE view; a child centred inside the middle track alone would drift
 * by half the difference between the two outer bands the moment they are not
 * the same width. Spanning gives the child the whole axis to centre in, which
 * is the anchor's own arithmetic. A spanning child contributes nothing to an
 * `auto` track's size (`grid-cells.ts`), so the outer bands still measure
 * exactly what hugs the edges, and the overlap this creates with the corner
 * cells is the ordinary co-placement §42 made legal.
 *
 * A SPAN STARTS AT TRACK 1, not at the band's own index - `place.column` is
 * where a span BEGINS, so `column: 2, colSpan: 3` would run off the end of a
 * three-track template and centre the child in tracks 2..3 instead of 1..3.
 */
const cellFor = (band: { x: Band; y: Band }): Raw => ({
  column: band.x === 'center' ? 1 : INDEX[band.x],
  row: band.y === 'center' ? 1 : INDEX[band.y],
  ...(band.x === 'center' ? { colSpan: 3 } : {}),
  ...(band.y === 'center' ? { rowSpan: 3 } : {}),
});

const regionChild = (region: unknown): unknown => {
  if (!isRecord(region)) return region;
  const band = BANDS[String(region.anchor)] ?? BANDS['top-left'];
  const root = migrateNode(region.root);
  if (!isRecord(root)) return root;
  return { ...root, place: cellFor(band), ...alignmentFor(band) };
};

/** A child the screen ALREADY held flowed in the whole screen box, under the
 *  regions - a full-bleed backdrop. It spans all nine cells so it still does. */
const heldChild = (child: unknown): unknown => (isRecord(child)
  ? { ...child, place: { column: 1, row: 1, colSpan: 3, rowSpan: 3 } }
  : child);

/**
 * The whole document. A `regions` array is folded into the screen's children
 * AFTER whatever the screen already held, so a backdrop authored as a screen
 * child still draws under them - which is exactly the order `layoutHud`
 * emitted the two in before this ran.
 */
const migrateScreen = (value: unknown): unknown => {
  if (!isRecord(value)) return value;
  const hasRegions = Array.isArray(value.regions);
  if (!hasRegions) {
    return isRecord(value.screen) ? { ...value, screen: migrateNode(value.screen) } : value;
  }
  const { regions, screen, ...rest } = value;
  const migrated = isRecord(screen) ? (migrateNode(screen) as Raw) : { id: 'screen', kind: 'container' };
  const held = Array.isArray(migrated.children) ? migrated.children : [];
  return {
    ...rest,
    screen: {
      ...migrated,
      // Every shipped screen was a `stack`, so it is a one-cell grid by now;
      // the three-band template is what it needs to BE the anchors, and it
      // replaces that placeholder wholesale.
      ...SCREEN_GRID,
      children: [...held.map(heldChild), ...(regions as unknown[]).map(regionChild)],
    },
  };
};

export { migrateScreen };
