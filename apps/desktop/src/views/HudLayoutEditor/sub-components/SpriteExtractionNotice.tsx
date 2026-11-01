/* @layer renderer-components @kind component */
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import { useSpriteExtraction } from '@app/hooks/useSpriteExtraction';

const SpriteExtractionNotice = () => {
  const { available, romFile, extracting, extract } = useSpriteExtraction();

  if (available) return null;

  return (
    <Box className="sprite-picker__notice">
      <Text variant="caption">
        {romFile ? 'Sprites are not fully extracted for this ROM.' : 'No ROM loaded. Extraction is unavailable.'}
      </Text>
      {romFile && (
        <Button variant="secondary" size="sm" onClick={extract} disabled={extracting}>
          {extracting ? 'Extracting...' : 'Extract sprites'}
        </Button>
      )}
    </Box>
  );
};

export { SpriteExtractionNotice };
