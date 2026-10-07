/* @layer renderer-components @kind logic */
/**
 * THE ALIGNMENT VALUES EACH ENGINE REALLY HAS, ONE ROW PER AXIS (§56).
 *
 * > "the alignment component has to be remade. it's a little confusing looking
 * > since it's small. we should have the example inside each square smaller and
 * > clear on their alignment. include stretch, start, end, in between, space,
 * > all in a similar grid like component that make sense."
 *
 * THE 3x3 PAD COULD NOT SAY "DISTRIBUTION" AT ALL. Nine cells cross two
 * POSITIONS, so `between` had no cell and rode beside the pad as a lone toggle,
 * and `stretch`, which is not a position either, did the same on the grid
 * side. Two engines, two orphans, and a pad whose 18px previews were unreadable
 * at the size they had to be to fit nine of them in 82px. One row of tiles per
 * axis has room for six values and for a diagram big enough to read.
 *
 * ONLY WHAT THE ENGINE SUPPORTS. A tile for a value that does nothing is a lie:
 *
 * - `grid` `justifyItems` / `alignItems`: start · center · end · stretch. A
 *   grid cell is a real box, so `stretch` is a real answer there (see
 *   `HudGridJustifyItems` in `hud-node.ts`).
 * - `flex` `justify` (main axis): start · center · end · between · around ·
 *   evenly. The last two are new in §56 and are in `place-flow.ts`.
 * - `flex` `align` (cross axis): start · center · end. NO `stretch`, since
 *   nothing is ever stretched under the flow engine (`hud-node.ts`'s own rule, and
 *   `place-flow.ts` reads a stray `stretch` as `start`).
 *
 * THE AXIS ROWS ARE NAMED BY WHAT THEY MOVE, NOT BY THE PROPERTY. A grid's two
 * axes are fixed, so they are drawn `↔` and `↕`. A flex container's are not:
 * `justify` acts along `direction`, so its rows are `main` and `cross` and the
 * diagrams turn with the direction, which is the one thing two text dropdowns
 * could never show and the 3x3 pad said only by swapping its own axes.
 */
type AlignPos = 'start' | 'center' | 'end';
type FlowDirection = 'row' | 'column';

/** Every value either axis of either engine can hold. */
type AlignValue = AlignPos | 'stretch' | 'between' | 'around' | 'evenly';

interface AlignOption {
  value: AlignValue;
  /** The tooltip and the accessible name. It gives the word and what it does. */
  label: string;
}

const OPTION: Readonly<Record<AlignValue, string>> = {
  start: 'start puts children at the beginning of the axis',
  center: 'center puts children in the middle of the axis',
  end: 'end puts children at the end of the axis',
  stretch: 'stretch makes children fill their cell along this axis',
  between: 'between puts the free space between the children, none at the ends',
  around: 'around gives each child an equal share, half of it at each side',
  evenly: 'evenly makes every gap the same, the two at the ends included',
};

const optionsOf = (values: readonly AlignValue[]): readonly AlignOption[] =>
  values.map((value) => ({ value, label: OPTION[value] }));

const GRID_ITEMS = optionsOf(['start', 'center', 'end', 'stretch']);
const FLEX_JUSTIFY = optionsOf(['start', 'center', 'end', 'between', 'around', 'evenly']);
const FLEX_ALIGN = optionsOf(['start', 'center', 'end']);

/** What the tile's own CSS is set to, so the diagram IS the value and not
 *  a picture somebody drew of it. `stretch` has no `justify-content` spelling
 *  because a stretched child has no free space to be positioned in. It falls to
 *  `flex-start` and the BARS grow instead (`hud-align-tile--stretch`). */
const CSS_POSITION: Readonly<Record<AlignValue, string>> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'flex-start',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

/** Which way a flex axis draws. `justify` runs along `direction`; `align`
 *  crosses it, so a row aligns DOWN and a column aligns ACROSS. */
const axisDirection = (
  axis: 'main' | 'cross', direction: FlowDirection,
): FlowDirection => {
  if (axis === 'main') return direction;
  return direction === 'row' ? 'column' : 'row';
};

export {
  CSS_POSITION, FLEX_ALIGN, FLEX_JUSTIFY, GRID_ITEMS, OPTION, axisDirection, optionsOf,
};
export type { AlignOption, AlignPos, AlignValue, FlowDirection };
