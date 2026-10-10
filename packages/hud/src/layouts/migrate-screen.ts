/* @layer shared-hud @kind logic */
import { gapPatch } from './migrate-gap';
import { BANDS, INDEX, ITEMS, SCREEN_GRID, TOP_LEFT_BAND } from './migrate-screen.constants';
import type { Raw } from './migrate-gap.type';
import type { BandPair } from './migrate-screen.type';

const isRecord = (value: unknown): value is Raw =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const alignmentFor = (band: BandPair): Raw => {
  const alignSelf = band.y === 'start' ? undefined : band.y;
  return {
    ...(alignSelf ? { alignSelf } : {}),
    ...(band.x === (alignSelf ?? 'start') ? {} : { justifySelf: band.x }),
  };
};

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

const cellFor = (band: BandPair): Raw => ({
  column: band.x === 'center' ? 1 : INDEX[band.x],
  row: band.y === 'center' ? 1 : INDEX[band.y],
  ...(band.x === 'center' ? { colSpan: 3 } : {}),
  ...(band.y === 'center' ? { rowSpan: 3 } : {}),
});

const regionChild = (region: unknown): unknown => {
  if (!isRecord(region)) return region;
  const band = BANDS[String(region.anchor)] ?? TOP_LEFT_BAND;
  const root = migrateNode(region.root);
  if (!isRecord(root)) return root;
  return { ...root, place: cellFor(band), ...alignmentFor(band) };
};

const heldChild = (child: unknown): unknown => (isRecord(child)
  ? { ...child, place: { column: 1, row: 1, colSpan: 3, rowSpan: 3 } }
  : child);

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
      ...SCREEN_GRID,
      children: [...held.map(heldChild), ...(regions as unknown[]).map(regionChild)],
    },
  };
};

export { migrateScreen };
