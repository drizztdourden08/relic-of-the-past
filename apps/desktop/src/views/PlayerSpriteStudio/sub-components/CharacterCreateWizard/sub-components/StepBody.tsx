/* @layer renderer-components @kind component */
import { RadioGroup, Text } from '@drizztdourden08/tessera/primitives';
import { ImportForm } from '@app/views/DataManager/sub-components/ImportForm';
import { CREATE_TEXT, IMPORTED_TEXT, STEP_IDS } from '../CharacterCreateWizard.constants';
import type { StepBodyProps } from '../CharacterCreateWizard.type';
import { SOURCE_OPTIONS } from './StepBody.constants';

const StepBody = ({ wizard, imported, onUrlImport, onFileImport }: StepBodyProps) => {
  switch (wizard.current.id) {
    case STEP_IDS.source:
      return (
        <RadioGroup
          label="Where the sprite comes from"
          direction="vertical"
          value={wizard.values.source}
          options={SOURCE_OPTIONS}
          onChange={(source) => wizard.update({ source })}
        />
      );
    case STEP_IDS.import:
      return (
        <>
          <ImportForm
            kind="linkSprite"
            accept={['.zspr', '.rsp']}
            placeholder="Paste .zspr or .rsp URL..."
            dropLabel="Drop a player sprite here"
            dropHint=".zspr or .rsp"
            onUrlImport={onUrlImport}
            onFileImport={onFileImport}
          />
          {imported !== null && <Text variant="caption" tone="success">{IMPORTED_TEXT}</Text>}
        </>
      );
    default:
      return <Text variant="body" tone="muted">{CREATE_TEXT}</Text>;
  }
};

export { StepBody };
