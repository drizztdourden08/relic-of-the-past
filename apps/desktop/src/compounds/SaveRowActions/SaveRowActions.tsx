/* @layer renderer-components @kind component */
import { ArmedIconButton } from '@drizztdourden08/tessera/composites';
import { Box } from '@drizztdourden08/tessera/primitives';
import type { ArmedAction } from '../ArmedActionButton';
import type { SaveRowActionsProps } from './SaveRowActions.type';
import './SaveRowActions.css';

const SaveRowActions = (props: SaveRowActionsProps) => {
  const { name, busy, tabIndex, overwriteDisabledReason, onLoad, onOverwrite, onDelete, onArmedChange } = props;
  const report = (action: ArmedAction) => ({ onArm: () => onArmedChange?.(action), onCancel: () => onArmedChange?.(null) });
  const confirm = (run: () => void) => () => {
    onArmedChange?.(null);
    run();
  };

  return (
    <Box className={onOverwrite ? 'save-row-actions' : 'save-row-actions save-row-actions--single'}>
      <ArmedIconButton icon="load-state" tone="info" label={`Load ${name}`} disabled={busy} tabIndex={tabIndex} onConfirm={confirm(onLoad)} {...report('load')} />
      {onOverwrite && (
        <ArmedIconButton
          icon="save-state"
          tone="warning"
          label={overwriteDisabledReason ?? `Overwrite ${name}`}
          disabled={busy || overwriteDisabledReason !== undefined}
          tabIndex={tabIndex}
          onConfirm={confirm(onOverwrite)}
          {...report('save')}
        />
      )}
      <Box className="save-row-actions__delete">
        <ArmedIconButton icon="trash-2" tone="danger" label={`Delete ${name}`} disabled={busy} tabIndex={tabIndex} onConfirm={confirm(onDelete)} {...report('delete')} />
      </Box>
    </Box>
  );
};

export { SaveRowActions };
