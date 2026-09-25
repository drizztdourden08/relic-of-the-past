/* @layer renderer-components @kind component */
/**
 * ONE LABELLED ROW OF TILES PER AXIS, AND EACH TILE DRAWS ITS OWN ANSWER (§56).
 *
 * > "the alignment component has to be remade. it's a little confusing looking
 * > since it's small. we should have the example inside each square smaller and
 * > clear on their alignment. include stretch, start, end, in between, space,
 * > all in a similar grid like component that make sense."
 *
 * THE DIAGRAM IS THE VALUE. A tile is a
 * container outline holding two or three bars, and the outline's own CSS is set
 * to the option the tile writes: a grid tile is a two-cell `display: grid` with
 * the literal `justify-items`/`align-items`, a flex tile is a `display: flex`
 * with the literal `justify-content`/`align-items`. So `space-around` cannot
 * draw as anything but `space-around`, and the day the engine's meaning drifts
 * from the browser's the tile is wrong in a way a screenshot shows.
 *
 * WHY THE 3x3 PAD HAD TO GO. Nine cells cross two POSITIONS, which is the one
 * thing alignment is not always about: `between` is a distribution and `stretch`
 * is a fill, so both ended up as two orphan toggles beside the pad, one per
 * engine, and neither `around` nor `evenly` could have been added at all.
 * A row per axis has room for six values, and for a diagram big enough to read:
 * the pad's previews were 18px square, nine of them inside 82px.
 *
 * THE FLEX DIAGRAMS TURN WITH `direction`, because a flex container's axes do.
 * `main` is whichever way the children flow, so a column's main-axis tiles draw
 * their bars stacked and distribute them vertically; `cross` is the other one.
 * A grid's axes do not move, so its rows are `↔` and `↕` and always draw across.
 *
 * EVERY TILE IN THE COMPONENT IS THE SAME TILE, and the widest row sets it. A
 * flex main axis offers six values against a cross axis's three; sized per row
 * (round 10) that drew the same control at two sizes, one above the other, and
 * allowed to WRAP instead of shrink (round 12) the six took three lines at the
 * 232px rail with the cap floating in the middle of the block it named. A row
 * per axis has to be a row, so the count is shared and the tiles shrink.
 */
import { Box } from '@ds/primitives/Box';
import { IconButton } from '@ds/primitives/IconButton';
import { Text } from '@ds/primitives/Text';
import { CSS_POSITION } from '../behavior/align-options';
import './HudLayoutEditor.layout.css';
import type { AlignOption, AlignValue, FlowDirection } from '../behavior/align-options';
import type { CSSProperties } from 'react';

interface AlignRowSpec {
  /** The document key this row writes, such as `justifyItems` or `justify`. Also
   *  the tile's `data-align` prefix, which is what the tests press. */
  key: string;
  /** The cap printed in front of the row: `↔`, `↕`, `main`, `cross`. */
  cap: string;
  /** The group's accessible name, since the cap is a glyph or an abbreviation. */
  label: string;
  /** A grid positions items in CELLS; a flex container distributes them. */
  engine: 'grid' | 'flex';
  /** `main` moves children ALONG the flow, `cross` moves them across it. */
  axis: 'main' | 'cross';
  options: readonly AlignOption[];
  value: string;
  onChange: (next: AlignValue) => void;
}

interface AlignmentTilesProps {
  /** Which way the children flow. A flex container's axes follow it. A grid
   *  is always drawn across, because its axes never move. */
  direction: FlowDirection;
  rows: readonly AlignRowSpec[];
}

/** Two for a grid (one per cell, which is what `justifyItems` positions), three
 *  for flex (enough to show a gap at each end AND one in the middle). */
const BARS = { grid: 2, flex: 3 } as const;

/** The outline's own layout, set to the option it stands for. */
const diagramStyle = (
  row: AlignRowSpec, value: AlignValue, direction: FlowDirection,
): CSSProperties => {
  if (row.engine === 'grid') {
    return {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      justifyItems: row.axis === 'main' ? value : 'center',
      alignItems: row.axis === 'cross' ? value : 'center',
    };
  }
  return {
    display: 'flex',
    flexDirection: direction,
    justifyContent: row.axis === 'main' ? CSS_POSITION[value] : 'flex-start',
    alignItems: row.axis === 'cross' ? CSS_POSITION[value] : 'center',
  };
};

/**
 * A bar lies ACROSS the axis its row moves it along, so it reads as a child
 * and not as an arrow. `stretch` is the one value that changes the bar
 * instead of moving it: the fixed dimension goes `auto` so the grid's own
 * `stretch` can fill the cell, which is precisely what the value does.
 */
const barStyle = (
  row: AlignRowSpec, value: AlignValue, direction: FlowDirection,
): CSSProperties => {
  const fill = value === 'stretch';
  if (row.engine === 'grid') {
    return row.axis === 'main'
      ? { width: fill ? 'auto' : 'var(--hud-align-bar)', height: '70%' }
      : { width: '70%', height: fill ? 'auto' : 'var(--hud-align-bar)' };
  }
  return direction === 'row'
    ? { width: 'var(--hud-align-bar)', height: '65%' }
    : { width: '65%', height: 'var(--hud-align-bar)' };
};

/** Four fit one line at every rail (a grid's start/center/end/stretch); more do not. */
const FOLD_ABOVE = 4;

const AlignmentTiles = (props: AlignmentTilesProps) => {
  const { direction, rows } = props;
  // A ROW LONGER THAN FOUR FOLDS IN HALF, ON PURPOSE. Six main-axis tiles on one
  // line came out ~26px wide at the 232px rail, where `between`, `around` and
  // `evenly` differ by about a pixel - three identical tiles. Folded to three
  // columns the six split where they mean something: POSITIONS (start, center,
  // end) over DISTRIBUTIONS (between, around, evenly) - the order `align-options`
  // already lists them in - and the cross-axis row lands in the same three
  // columns, so start/center/end line up down the whole component. This is not
  // round 12's `auto-fill` (ragged lines, a label floating mid-block): the count
  // is fixed, so every line is full and the fold is always in the same place.
  const columns = Math.max(...rows.map(
    (row) => (row.options.length > FOLD_ABOVE ? Math.ceil(row.options.length / 2) : row.options.length),
  ));

  return (
    <Box className="hud-align" style={{ '--hud-align-cols': columns } as CSSProperties}>
      {rows.map((row) => (
        <Box key={row.key} className="hud-align__row" role="group" aria-label={row.label}>
          <Text className="hud-align__cap" title={row.label}>{row.cap}</Text>
          <Box className="hud-align__tiles">
            {row.options.map((option) => (
              <IconButton
                key={option.value}
                className="hud-align__tile"
                variant="ghost"
                size="sm"
                active={row.value === option.value}
                label={`${row.label}. ${option.label}`}
                title={option.label}
                data-align={`${row.key}:${option.value}`}
                onClick={() => row.onChange(option.value)}
              >
                <Box
                  className="hud-align__diagram"
                  data-engine={row.engine}
                  data-flow={row.engine === 'grid' ? 'row' : direction}
                  style={diagramStyle(row, option.value, direction)}
                >
                  {Array.from({ length: BARS[row.engine] }, (_unused, i) => (
                    <Box
                      key={i}
                      className="hud-align__bar"
                      style={barStyle(row, option.value, direction)}
                    />
                  ))}
                </Box>
              </IconButton>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export { AlignmentTiles, BARS, barStyle, diagramStyle };
export type { AlignRowSpec, AlignmentTilesProps };
