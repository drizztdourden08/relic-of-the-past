/* @layer renderer-components @kind hook */
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as spritesStore from '@app/storage/sprites-store';
import { useSpriteAvailabilityStore } from '@app/stores/sprite-availability-store';
import type { ExtractedStatus } from '../SpriteManager.type';

const useSpriteLibrary = (romStatuses: RomDisplayInfo[]) => {
  const [extractedMap, setExtractedMap] = useState<Record<string, ExtractedStatus>>({});
  const [selectedRom, setSelectedRom] = useState('');

  const romsWithAssets = useMemo(() => romStatuses.filter(r => r.hasAssets), [romStatuses]);

  const refreshExtracted = useCallback(async () => {
    const entries = await Promise.all(
      romsWithAssets.map(async (r) => [r.romFile, await spritesStore.checkSpritesExtracted(r.romFile)] as const)
    );
    setExtractedMap(Object.fromEntries(entries));
  }, [romsWithAssets]);

  const spritesAvailable = useSpriteAvailabilityStore((s) => s.available);
  useEffect(() => { void refreshExtracted(); }, [refreshExtracted, spritesAvailable]);

  const importedRoms = useMemo(
    () => romsWithAssets.filter(r => extractedMap[r.romFile]?.extracted),
    [romsWithAssets, extractedMap]
  );

  useEffect(() => {
    const [firstRom] = importedRoms;
    if (firstRom === undefined) { setSelectedRom(''); return; }
    if (!importedRoms.some(r => r.romFile === selectedRom)) setSelectedRom(firstRom.romFile);
  }, [importedRoms, selectedRom]);

  return {
    extractedMap, selectedRom, setSelectedRom, romsWithAssets, importedRoms, refreshExtracted,
  };
};

export { useSpriteLibrary };
