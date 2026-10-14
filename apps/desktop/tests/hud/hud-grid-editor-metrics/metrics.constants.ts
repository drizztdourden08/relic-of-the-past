/* @layer tests @kind constants */
import { resolve } from 'path';
import type { Extent, HudGridContainer, HudNode, HudPlace, MeasureContext } from '@rotp/hud';
import { REPO_ROOT } from '../../repo-root';

const leaf = (id: string, place?: HudPlace): HudNode =>
  ({ id, kind: 'element', element: { type: 'spacer' }, size: { w: { px: 16 }, h: { px: 16 } }, ...(place ? { place } : {}) });

const gridOf = (columns: Extent[], rows: Extent[], children: HudNode[], id = 'g'): HudGridContainer =>
  ({ kind: 'container', id, layout: 'grid', columns, rows, children });

const many = (count: number): Extent[] => Array.from({ length: count }, () => 'auto' as const);

const EDITOR_DIR = resolve(REPO_ROOT, 'apps/desktop/src/views/HudLayoutEditor/sub-components');
const ECHO = { containerId: 'echo-grid', c0: 2, c1: 3, r0: 1, r1: 1 };
const CTX: MeasureContext = { hearts: 3, filledSlots: [], scope: {} };
const VIEW = { x: 0, y: 0, w: 398, h: 224 };
const RAILS = [188, 232, 320];

const THREE = gridOf(['auto', 'fill', 'auto'], ['auto', 'fill', 'auto'], [
  leaf('vitals', { column: 1, row: 1 }),
  leaf('wallet', { column: 1, row: 3 }),
]);
const TWELVE = gridOf(many(12), many(10), []);
const STATES = gridOf(many(3), many(2), [
  leaf('under', { column: 1, row: 1 }),
  leaf('band', { column: 1, row: 1, colSpan: 2 }),
  leaf('other', { column: 2, row: 2 }),
]);

const ECHO_GRID = gridOf([{ px: 20 }, { px: 20 }, { px: 20 }], [{ px: 10 }], [], 'echo-grid');
const ECHO_BOX = { x: 8, y: 6, w: 120, h: 40 };
const ECHO_SCALE = 2;

export {
  CTX, ECHO, ECHO_BOX, ECHO_GRID, ECHO_SCALE, EDITOR_DIR, RAILS, STATES, THREE, TWELVE, VIEW,
};
