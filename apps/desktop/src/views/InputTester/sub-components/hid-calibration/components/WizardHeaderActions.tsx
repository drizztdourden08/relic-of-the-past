/* @layer renderer-components @kind component */
import { Box, Button } from '@drizztdourden08/tessera/primitives';
import { COPY_LABEL, SAVE_LABEL } from './WizardHeaderActions.constants';
import type { WizardHeaderActionsProps } from './WizardHeaderActions.type';

const WizardHeaderActions = (props: WizardHeaderActionsProps) => {
  const { copyStatus, saveStatus, capturedCount, onCopyJson, onSaveDebugFile, onFinish, onCancel } = props;
  return (
    <Box className="hid-cal__header-actions">
      <Button variant={copyStatus === 'error' ? 'danger' : 'tertiary'} size="sm" onClick={onCopyJson} title="Copy partial or complete calibration JSON">
        {COPY_LABEL[copyStatus]}
      </Button>
      <Button variant={saveStatus === 'error' ? 'danger' : 'tertiary'} size="sm" onClick={onSaveDebugFile} title="Write calibration JSON to the userData debug folder">
        {SAVE_LABEL[saveStatus]}
      </Button>
      <Button variant="primary" size="sm" onClick={onFinish} disabled={capturedCount === 0}>
        Finish
      </Button>
      <Button variant="danger" size="sm" onClick={onCancel}>Cancel</Button>
    </Box>
  );
};

export { WizardHeaderActions };
