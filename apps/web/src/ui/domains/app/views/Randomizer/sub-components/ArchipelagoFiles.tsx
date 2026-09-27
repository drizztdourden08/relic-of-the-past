/* @layer renderer-components @kind component */
/**
 * The Run tab's one Archipelago action: save the files a host needs for this
 * slot, then show where they went (or why they did not).
 */
import { Box, Button, Text } from '@ds/primitives';
import { useSaveArchipelagoFiles } from '../behavior/useSaveArchipelagoFiles';

interface ArchipelagoFilesProps {
  profileId: string;
}

const ArchipelagoFiles = ({ profileId }: ArchipelagoFilesProps) => {
  const { saving, feedback, save } = useSaveArchipelagoFiles(profileId);

  return (
    <>
      <Box className="randomizer-page__actions">
        <Button variant="secondary" onClick={() => { void save(); }} disabled={saving}>
          Save Archipelago files...
        </Button>
      </Box>
      {feedback && (
        <Text className={`randomizer-page__hint randomizer-page__hint--${feedback.tone}`}>{feedback.text}</Text>
      )}
    </>
  );
};

export { ArchipelagoFiles };
export type { ArchipelagoFilesProps };
