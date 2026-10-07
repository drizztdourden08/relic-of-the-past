/* @layer renderer-components @kind component */
/**
 * THE CONTEXTUAL TOOLBAR IS ONE ROW WITH ONE SUBJECT AND NOTHING IN IT BUT BUTTONS.
 *
 * THE MAINTAINER, FOR THE THIRD TIME (§54): "the global grid setting should be on
 * a different tool visually. that toolbar that sticks to the top is for
 * contextualized selection ONLY." §50 filed the properties as rows of the
 * nothing-selected table; §51 moved them to a persistent LEFT GROUP in this same
 * strip, which is the same mistake wearing a partition. They are gone from here
 * entirely. Engine, guide, gap and item alignment are sections one and two, and
 * add-column/add-row are the lattice's own trailing `+`s (§55). What is left is
 * insert, move, remove: exactly the things that act on what is picked.
 *
 * AND IT IS ONE ROW AT EVERY RAIL NOW, NOT "ONE ROW THAT WRAPS" (§55). §54's
 * last `control` slot was the picked track's `[auto ▾]` extent field. It was 81px,
 * which is what pushed a selected track's five buttons onto a second line at the
 * 232px rail. A track's size is on its own header now (`TrackHead`), so this
 * strip renders buttons and a chip and nothing else, and the `control` kind is
 * gone from the renderer with it.
 *
 * IT SAYS WHAT IT IS ACTING ON. The leading chip is `COLUMN 2`, `ROW 1`,
 * `3 CELLS` under a grid and `ITEM 2`, `3 ITEMS` under a flex container, read off
 * the same selection each editor's status line reads. With nothing selected the
 * chip is `null` and the strip prints one muted hint in the SAME reserved
 * height, so the drawing below never moves.
 *
 * THE HINT IS THE CALLER'S WORDS (§58). It shipped as the grid's own "select a
 * cell, column or row", which is what the flex manipulation section printed the
 * first time it was photographed. That was a strip telling somebody to pick a column in
 * a control that has none.
 *
 * IT IS `aria-live="polite"`, because a strip that fills itself in response to a
 * press somewhere else is a change a screen reader has no other way to hear.
 *
 * IT IS THE SAME KIND OF TOOLBAR AS THE SCREEN'S OWN (§50). `.hud-toolbar`,
 * `.hud-toolbar__button` and `.hud-toolbar__sep` are reused verbatim, not
 * re-cut, which is the only way "the same kind of toolbar" survives the next
 * change to either one. A row's `group` decides where a separator goes, so
 * grouping is a property of the action table, not of this file.
 *
 * NOTHING IS DISABLED HERE. An action that cannot apply is not in the table, so
 * there is no greyed glyph to read past.
 */
import { Fragment } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import './HudLayoutEditor.bands.css';
import type { ReactNode } from 'react';
import type { EditorAction } from './selection-bands.type';

/** The grid's wording, kept as the default because it is the one every existing
 *  test presses and the one the lattice means. */
const NO_SELECTION = 'select a cell, column or row';

interface SelectionToolbarProps {
  /** What the actions act on. `null` when nothing is selected. */
  chip: string | null;
  /** Actions on the selection, and ONLY those. Empty when there is none. */
  actions: readonly EditorAction[];
  /** What to say when nothing is picked, in the mounting control's own nouns. */
  hint?: string;
}

const renderRows = (actions: readonly EditorAction[]): ReactNode[] => {
  let lastGroup: string | undefined;
  const out: ReactNode[] = [];
  for (const action of actions) {
    if (action.kind !== 'button') continue;
    const separator = lastGroup !== undefined && action.group !== lastGroup;
    lastGroup = action.group;
    out.push(
      <Fragment key={action.key}>
        {separator && <Box className="hud-toolbar__sep" />}
        <Button
          variant="bare"
          className="hud-toolbar__button"
          aria-label={action.label}
          title={action.label}
          data-action={action.key}
          disabled={action.disabled}
          onClick={action.disabled ? undefined : action.run}
        >
          {action.icon && <IconifyIcon icon={action.icon} width={16} height={16} aria-hidden />}
        </Button>
      </Fragment>,
    );
  }
  return out;
};

const SelectionToolbar = (props: SelectionToolbarProps) => {
  const { chip, actions, hint = NO_SELECTION } = props;
  return (
    <Box
      className="hud-toolbar hud-grid__bar"
      role="toolbar"
      aria-live="polite"
      aria-label="Actions on the selection"
    >
      {chip === null ? (
        <Text className="hud-grid__bar-hint">{hint}</Text>
      ) : (
        <>
          <Text className="hud-grid__bar-chip" data-chip={chip}>{chip}</Text>
          <Box className="hud-toolbar__sep" />
          {renderRows(actions)}
        </>
      )}
    </Box>
  );
};

export { SelectionToolbar, NO_SELECTION, renderRows };
export type { SelectionToolbarProps };
