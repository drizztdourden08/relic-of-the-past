/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { ArmedActionButton, useArmedAction } from '../ArmedActionButton';
import type { SaveRowActionsProps } from './SaveRowActions.type';
import './SaveRowActions.css';

const SaveRowActions = (props: SaveRowActionsProps) => {
  const { name, resetKey, busy, tabIndex, overwriteDisabledReason, onLoad, onOverwrite, onDelete } = props;
  const { armed, press, disarm } = useArmedAction({ resetKey });

  return (
    <Box className="save-row-actions">
      <ArmedActionButton
        action="load"
        label={`Load ${name}`}
        caption="Load"
        disabled={busy}
        armed={armed === 'load'}
        tabIndex={tabIndex}
        onPress={() => press('load', onLoad)}
        onDisarm={disarm}
      />
      {onOverwrite && (
        <ArmedActionButton
          action="save"
          label={`Overwrite ${name}`}
          caption="Overwrite"
          disabled={busy || overwriteDisabledReason !== undefined}
          disabledReason={overwriteDisabledReason}
          armed={armed === 'save'}
          tabIndex={tabIndex}
          onPress={() => press('save', onOverwrite)}
          onDisarm={disarm}
        />
      )}
      <ArmedActionButton
        action="delete"
        label={`Delete ${name}`}
        caption="Delete"
        disabled={busy}
        armed={armed === 'delete'}
        tabIndex={tabIndex}
        onPress={() => press('delete', onDelete)}
        onDisarm={disarm}
      />
    </Box>
  );
};

export { SaveRowActions };
