/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ActionButtons } from './sub-components/ActionButtons';
import { NO_SELECTION } from './SelectionToolbar.constants';
import type { SelectionToolbarProps } from './SelectionToolbar.type';
import { useT, useText } from '@drizztdourden08/brock-react';

const SelectionToolbar = (props: SelectionToolbarProps) => {
  const t = useT();
  const text = useText();
  const { chip, actions, hint = text(NO_SELECTION) } = props;
  return (
    <Box
      className="hud-toolbar hud-grid__bar"
      role="toolbar"
      aria-live="polite"
      aria-label={t('hud-editor:selection-toolbar.aria.actions-on-the-selection')}
    >
      {chip === null ? (
        <Text className="hud-grid__bar-hint">{hint}</Text>
      ) : (
        <>
          <Text className="hud-grid__bar-chip" data-chip={chip}>{chip}</Text>
          <Box className="hud-toolbar__sep" />
          <ActionButtons actions={actions} />
        </>
      )}
    </Box>
  );
};

export { SelectionToolbar };
