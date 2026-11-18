/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Button, ButtonRow, Text } from '@drizztdourden08/tessera/primitives';
import type { LayerEditorFooterProps } from './LayerEditorFooter.type';

const LayerEditorFooter = (props: LayerEditorFooterProps) => {
  const { locked, dirty, saving, onSave, onRevert } = props;
  const t = useT();
  return (
    <ButtonRow align="start">
      <Button variant="primary" size="sm" disabled={locked || !dirty} onClick={onSave}>
        {saving ? t('msu-studio:layers.saving') : t('msu-studio:layers.save')}
      </Button>
      <Button variant="tertiary" size="sm" disabled={locked || !dirty} onClick={onRevert}>{t('msu-studio:layers.revert')}</Button>
      {dirty && !saving && <Text variant="caption">{t('msu-studio:layers.unsaved')}</Text>}
    </ButtonRow>
  );
};

export { LayerEditorFooter };
