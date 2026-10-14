/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import * as spritesStore from '@app/storage/sprites-store';
import type { SpriteActionsParams, SpriteMessage } from './sprite-manager.type';

const useSpriteActions = (params: SpriteActionsParams) => {
  const { toExtract, setToExtract, setSelectedRom, refreshExtracted } = params;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<SpriteMessage | null>(null);

  const handleExtract = useCallback(async () => {
    if (!toExtract) return;
    setBusy(true); setMessage(null);
    const result = await spritesStore.extractSprites(toExtract);
    setBusy(false);
    if (result.success) {
      setMessage({ type: 'success', text: `Extracted ${result.count ?? 0} sprites` });
      await refreshExtracted();
      setSelectedRom(toExtract);
      setToExtract('');
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Extraction failed' });
    }
  }, [toExtract, refreshExtracted, setSelectedRom, setToExtract]);

  const handleDelete = useCallback(async (romFile: string) => {
    setBusy(true); setMessage(null);
    const result = await spritesStore.deleteSprites(romFile);
    setBusy(false);
    if (result.success) {
      await refreshExtracted();
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Delete failed' });
    }
  }, [refreshExtracted]);

  return { busy, message, handleExtract, handleDelete };
};

export { useSpriteActions };
