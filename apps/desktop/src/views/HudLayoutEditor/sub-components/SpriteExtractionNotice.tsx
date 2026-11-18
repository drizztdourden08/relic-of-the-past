/* @layer renderer-components @kind component */
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import { useSpriteExtraction } from '@app/hooks/useSpriteExtraction';
import { useT } from '@drizztdourden08/brock-react';

const SpriteExtractionNotice = () => {
  const t = useT();
  const { available, romFile, extracting, extract } = useSpriteExtraction();

  if (available) return null;

  return (
    <Box className="sprite-picker__notice">
      <Text variant="caption">
        {romFile ? t('hud-editor:sprite-extraction.partial') : t('hud-editor:sprite-extraction.no-rom')}
      </Text>
      {romFile && (
        <Button variant="secondary" size="sm" onClick={extract} disabled={extracting}>
          {extracting ? t('hud-editor:sprite-extraction.extracting') : t('hud-editor:sprite-extraction.extract')}
        </Button>
      )}
    </Box>
  );
};

export { SpriteExtractionNotice };
