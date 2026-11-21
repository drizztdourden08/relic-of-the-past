/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { RadioGroup, Text } from '@drizztdourden08/tessera/primitives';
import { ImportForm } from '@app/views/DataManager/sub-components/ImportForm';
import { STEP_IDS } from '../CharacterCreateWizard.constants';
import type { StepBodyProps } from '../CharacterCreateWizard.type';
import { sourceOptionsOf } from './StepBody.constants';

const StepBody = ({ wizard, imported, onUrlImport, onFileImport }: StepBodyProps) => {
  const t = useT();
  switch (wizard.current.id) {
    case STEP_IDS.source:
      return (
        <RadioGroup
          label={t('views-player-sprite-studio:wizard.sourceLabel')}
          direction="vertical"
          value={wizard.values.source}
          options={sourceOptionsOf(t)}
          onChange={(source) => wizard.update({ source })}
        />
      );
    case STEP_IDS.import:
      return (
        <>
          <ImportForm
            kind="linkSprite"
            accept={['.zspr', '.rsp']}
            placeholder={t('views-player-sprite-studio:wizard.import.placeholder')}
            dropLabel={t('views-player-sprite-studio:wizard.import.dropLabel')}
            dropHint={t('views-player-sprite-studio:wizard.import.dropHint')}
            onUrlImport={onUrlImport}
            onFileImport={onFileImport}
          />
          {imported !== null && <Text variant="caption" tone="success">{t('views-player-sprite-studio:wizard.importedText')}</Text>}
        </>
      );
    default:
      return <Text variant="body" tone="muted">{t('views-player-sprite-studio:wizard.createText')}</Text>;
  }
};

export { StepBody };
