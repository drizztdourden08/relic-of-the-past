/* @layer renderer-components @kind component */
import { Button, Text } from '@drizztdourden08/tessera/primitives';
import { useSaveArchipelagoFiles } from '../behavior/useSaveArchipelagoFiles';
import type { ArchipelagoFilesProps } from './ArchipelagoFiles.type';

const ArchipelagoFiles = (props: ArchipelagoFilesProps) => {
  const { config } = props;
  const { saving, feedback, save } = useSaveArchipelagoFiles(config);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => { void save(); }} disabled={saving}>
        Save Archipelago files...
      </Button>
      {feedback && (
        <Text className={`randomizer-page__hint${feedback.tone === 'error' ? ' randomizer-page__hint--error' : ''}`}>
          {feedback.text}
        </Text>
      )}
    </>
  );
};

export { ArchipelagoFiles };
