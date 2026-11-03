/* @layer renderer-other @kind hook */
import { useCallback, useState } from 'react';
import { useSpriteAvailabilityStore } from '@app/stores/sprite-availability-store';
import * as spritesStore from '@app/storage/sprites-store';

const useSpriteExtraction = () => {
  const { available, romFile, setAvailability } = useSpriteAvailabilityStore();
  const [extracting, setExtracting] = useState(false);

  const extract = useCallback(async () => {
    if (!romFile || extracting) return;
    setExtracting(true);
    const res = await spritesStore.extractSprites(romFile);
    if (res.success) {
      const { extracted } = await spritesStore.checkSpritesExtracted(romFile);
      setAvailability(romFile, extracted);
    }
    setExtracting(false);
  }, [romFile, extracting, setAvailability]);

  return { available, romFile, extracting, extract, setAvailability };
};

export { useSpriteExtraction };
