/* @layer renderer-components @kind component */
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../../design-system/primitives/Button';
import type { WizardHeaderActionsProps } from './WizardHeaderActions.type';

const WizardHeaderActions = (props: WizardHeaderActionsProps) => {
  const { copyStatus, saveStatus, capturedCount, onCopyJson, onSaveDebugFile, onFinish, onCancel } = props;
  return (
    <Box className="hid-cal__header-actions">
      <Button variant={copyStatus === 'error' ? 'danger' : 'tertiary'} size="sm" onClick={onCopyJson} title="Copy partial or complete calibration JSON">
        {copyStatus === 'ok' ? '✓ Copied' : copyStatus === 'error' ? '✗ Failed' : 'Copy JSON'}
      </Button>
      <Button variant={saveStatus === 'error' ? 'danger' : 'tertiary'} size="sm" onClick={onSaveDebugFile} title="Write calibration JSON to the userData debug folder">
        {saveStatus === 'ok' ? '✓ Saved' : saveStatus === 'error' ? '✗ Failed' : 'Save to Debug Folder'}
      </Button>
      <Button variant="primary" size="sm" onClick={onFinish} disabled={capturedCount === 0}>
        Finish
      </Button>
      <Button variant="danger" size="sm" onClick={onCancel}>Cancel</Button>
    </Box>
  );
};

export { WizardHeaderActions };
