/* @layer renderer-components @kind component */
import { useEffect } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { useArmedAction } from '../ArmedActionButton';
import { SaveRowActionButton } from '../SaveRowActionButton';
import { SAVE_ROW_ICONS } from './SaveRowActions.constants';
import type { SaveRowActionsProps } from './SaveRowActions.type';
import './SaveRowActions.css';

const SaveRowActions = (props: SaveRowActionsProps) => {
  const { name, resetKey, busy, tabIndex, overwriteDisabledReason, onLoad, onOverwrite, onDelete, onArmedChange } = props;
  const { armed, press, disarm } = useArmedAction({ resetKey });

  useEffect(() => onArmedChange?.(armed), [armed, onArmedChange]);

  return (
    <Box className={onOverwrite ? 'save-row-actions' : 'save-row-actions save-row-actions--single'}>
      <SaveRowActionButton
        label={`Load ${name}`}
        icons={SAVE_ROW_ICONS.load}
        disabled={busy}
        armed={armed === 'load'}
        tabIndex={tabIndex}
        onPress={() => press('load', onLoad)}
        onDisarm={disarm}
      />
      {onOverwrite && (
        <SaveRowActionButton
          label={`Overwrite ${name}`}
          icons={SAVE_ROW_ICONS.save}
          disabled={busy || overwriteDisabledReason !== undefined}
          disabledReason={overwriteDisabledReason}
          armed={armed === 'save'}
          tabIndex={tabIndex}
          onPress={() => press('save', onOverwrite)}
          onDisarm={disarm}
        />
      )}
      <Box className="save-row-actions__delete">
        <SaveRowActionButton
          label={`Delete ${name}`}
          icons={SAVE_ROW_ICONS.delete}
          disabled={busy}
          armed={armed === 'delete'}
          tabIndex={tabIndex}
          onPress={() => press('delete', onDelete)}
          onDisarm={disarm}
        />
      </Box>
    </Box>
  );
};

export { SaveRowActions };
