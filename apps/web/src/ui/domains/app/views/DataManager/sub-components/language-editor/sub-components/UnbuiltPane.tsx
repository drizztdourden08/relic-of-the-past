/* @layer renderer-components @kind component */
/**
 * A pane whose editing surface exists but does not reach the game yet.
 *
 * These tabs are real: they read the shipped text, measure it against the room
 * each surface actually has, and keep what is typed. What they do NOT do is
 * change anything a player would see — nothing here is baked into the assets or
 * read by the menu. Left unmarked that is indistinguishable from a bug, so the
 * pane says it twice: once in a notice that stays readable, and once as a scrim
 * over the surface itself, which also takes the surface out of the tab order.
 *
 * Kept visible rather than hidden for the same reason the widget locks are: the
 * shape of the work is worth seeing while it is being decided.
 */
import { Box, Text } from '@ds/primitives';
import { DisabledOverlay } from '@ds/composites/DisabledOverlay';
import type { ReactNode } from 'react';
import './UnbuiltPane.css';

type UnbuiltPaneProps = {
  /** What this surface would do once it is wired, in the player's terms. */
  summary: string;
  children: ReactNode;
};

const TITLE = 'Not built yet';
const SCRIM = 'Nothing typed here reaches the game.';

const UnbuiltPane = (props: UnbuiltPaneProps) => {
  const { summary, children } = props;

  return (
    <Box className="unbuilt-pane">
      <Box className="unbuilt-pane__notice" role="status">
        <Text as="span" className="unbuilt-pane__title">{TITLE}</Text>
        <Text as="span" variant="caption" className="unbuilt-pane__summary">{summary}</Text>
      </Box>

      <DisabledOverlay active contained message={SCRIM} className="unbuilt-pane__body">
        {children}
      </DisabledOverlay>
    </Box>
  );
};

export { UnbuiltPane };
export type { UnbuiltPaneProps };
