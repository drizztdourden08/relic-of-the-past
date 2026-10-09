/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { renderRows } from '../behavior/render-rows';
import '../HudLayoutEditor.bands.css';
import { NO_SELECTION } from './SelectionToolbar.constants';
import type { SelectionToolbarProps } from './SelectionToolbar.type';

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

export { SelectionToolbar };
export type { SelectionToolbarProps } from './SelectionToolbar.type';
