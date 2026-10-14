/* @layer renderer-components @kind component */
import { Button, ButtonRow, Text } from '@drizztdourden08/tessera/primitives';
import type { LayerEditorFooterProps } from './LayerEditorFooter.type';

const LayerEditorFooter = (props: LayerEditorFooterProps) => {
  const { locked, dirty, saving, onSave, onRevert } = props;
  return (
    <ButtonRow align="start">
      <Button variant="primary" size="sm" disabled={locked || !dirty} onClick={onSave}>
        {saving ? 'Saving...' : 'Save layers'}
      </Button>
      <Button variant="tertiary" size="sm" disabled={locked || !dirty} onClick={onRevert}>Revert</Button>
      {dirty && !saving && <Text variant="caption">Unsaved changes</Text>}
    </ButtonRow>
  );
};

export { LayerEditorFooter };
