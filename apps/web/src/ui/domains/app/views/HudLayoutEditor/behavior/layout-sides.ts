/* @layer renderer-components @kind logic */
/**
 * THE ONE PLACE THE TWO ENGINES ARE TRANSLATED INTO THE SHAPES THE TWO SECTIONS
 * TAKE (§56). Every `if (grid)` in the panel is here, so neither section has one.
 *
 * SECTION ONE ASKS THIS FILE NOTHING IT HAS TO BRANCH ON ANY MORE (§58). Both
 * engines store `gap: { x, y }` (§57), so `gapCellsOf` answers the SAME two
 * cells for both and the `if (grid)` that used to live in it is deleted, which
 * is what makes pressing Type leave section one's shape alone. The type, the
 * overlay and the guide need no translation either: the type is the same
 * question for both, the guide is on any container and the overlay flag is the
 * EDITOR's.
 *
 * ALIGNMENT IS THE ONE THING LEFT THAT IS PER-ENGINE:
 *
 * > "why is the engine used in the second section??? First section IS which
 * > type and only the global stuff in there, nothing specific to grid or flex,
 * > then the rest of the sections are specifics."
 *
 * A grid positions ITEMS IN CELLS on two fixed axes (`justifyItems` /
 * `alignItems`, both defaulting to `stretch` in `place-grid.ts`), and a cell is
 * a real box so `stretch` is a real answer. A flex container DISTRIBUTES along
 * whichever axis it flows (`justify`, six values since §56) and positions
 * across it (`align`, three values, since nothing is ever stretched under the flow engine).
 * Different values, different axes, different meanings: which is exactly what
 * "specific to grid or flex" means, and why the component moved out of section
 * one with §55's two orphan toggles deleted instead of re-homed.
 */
import { FLEX_ALIGN, FLEX_JUSTIFY, GRID_ITEMS } from './align-options';
import type { AlignPos, AlignValue } from './align-options';
import type { AlignRowSpec } from '../sub-components/AlignmentTiles';
import type { GapCell } from '../sub-components/LayoutSettings.type';
import type {
  HudContainer, HudFlexContainer, HudGridContainer, HudGridJustifyItems,
} from '@shared/types/hud';

type PatchGrid = (patch: Partial<HudGridContainer>) => void;
type PatchFlex = (patch: Partial<HudFlexContainer>) => void;

/** TWO CELLS, ALWAYS, UNDER EITHER ENGINE (§58). `x` is horizontal and `y` is
 *  vertical whichever way the children flow (§57.1), so `↔` and `↕` mean the
 *  same thing to a grid and to a row and to a column, which is what lets
 *  section one keep its shape when Type is pressed. The cap is what the field
 *  wears in its own row; the label is what a screen reader says. */
const gapCellsOf = (node: HudContainer): GapCell[] => [
  { axis: 'x', cap: '↔', label: 'gap x', value: node.gap?.x ?? 0 },
  { axis: 'y', cap: '↕', label: 'gap y', value: node.gap?.y ?? 0 },
];

/** Two fixed axes, four values each, `stretch` among them. */
const gridAlignRows = (container: HudGridContainer, onPatch: PatchGrid): AlignRowSpec[] => [
  {
    key: 'justifyItems', cap: '↔', label: 'items across the cell', engine: 'grid', axis: 'main',
    options: GRID_ITEMS, value: container.justifyItems ?? 'stretch',
    onChange: (next: AlignValue) => onPatch({ justifyItems: next as HudGridJustifyItems }),
  },
  {
    key: 'alignItems', cap: '↕', label: 'items down the cell', engine: 'grid', axis: 'cross',
    options: GRID_ITEMS, value: container.alignItems ?? 'stretch',
    onChange: (next: AlignValue) => onPatch({ alignItems: next as HudGridJustifyItems }),
  },
];

/** Two moving axes, named for the flow instead of a screen direction.
 *  `main` is whichever way `direction` points, and the tiles turn with it. */
const flexAlignRows = (node: HudFlexContainer, onPatch: PatchFlex): AlignRowSpec[] => [
  {
    key: 'justify', cap: 'main', label: 'along the main axis', engine: 'flex', axis: 'main',
    options: FLEX_JUSTIFY, value: node.justify ?? 'start',
    onChange: (next: AlignValue) => onPatch({ justify: next as HudFlexContainer['justify'] }),
  },
  {
    key: 'align', cap: 'cross', label: 'across the cross axis', engine: 'flex', axis: 'cross',
    options: FLEX_ALIGN, value: node.align ?? 'start',
    onChange: (next: AlignValue) => onPatch({ align: next as AlignPos }),
  },
];

export { flexAlignRows, gapCellsOf, gridAlignRows };
export type { PatchFlex, PatchGrid };
