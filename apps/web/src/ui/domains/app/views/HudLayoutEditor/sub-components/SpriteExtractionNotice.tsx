/* @layer renderer-components @kind component */
/**
 * "Sprites aren't (fully) extracted for this ROM". This is the one place every
 * sprite picker in the editor surfaces that, with a one-click fix, instead of
 * silently blanking every tile. `SpritePicker` itself owns no store (it is a
 * design-system composite), so this View-tier component is what actually
 * reads `sprite-availability-store` and calls the extraction pipeline; call
 * sites just render `<SpriteExtractionNotice />` as the picker's `notice` prop
 * and get nothing back once sprites are available, no ternary required.
 *
 * Mirrors `HudStyleControl`'s own notice+extract pattern (same store, same
 * `extractSprites` call). This is the popover-sized version of it.
 */
import { useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { useSpriteAvailabilityStore } from '@app/stores/sprite-availability-store';
import * as spritesStore from '@app/lib/storage/sprites-store';

const SpriteExtractionNotice = () => {
  const { available, romFile, setAvailability } = useSpriteAvailabilityStore();
  const [extracting, setExtracting] = useState(false);

  if (available) return null;

  const handleExtract = async () => {
    if (!romFile || extracting) return;
    setExtracting(true);
    const res = await spritesStore.extractSprites(romFile);
    if (res.success) {
      const { extracted } = await spritesStore.checkSpritesExtracted(romFile);
      setAvailability(romFile, extracted);
    }
    setExtracting(false);
  };

  return (
    <Box className="hud-picker-grid__notice">
      <Text variant="caption">
        {romFile ? 'Sprites are not fully extracted for this ROM.' : 'No ROM loaded. Extraction is unavailable.'}
      </Text>
      {romFile && (
        <Button variant="secondary" size="sm" onClick={handleExtract} disabled={extracting}>
          {extracting ? 'Extracting...' : 'Extract sprites'}
        </Button>
      )}
    </Box>
  );
};

export { SpriteExtractionNotice };
