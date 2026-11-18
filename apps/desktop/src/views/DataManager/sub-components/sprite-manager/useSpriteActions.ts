/* @layer renderer-components @kind hook */
import { useT } from '@drizztdourden08/brock-react';
import { useState, useCallback } from 'react';
import type { CreateOutcome } from '@drizztdourden08/tessera/composites';
import * as spritesStore from '@app/storage/sprites-store';
import type { SpriteActionsParams } from './sprite-manager.type';

const useSpriteActions = (params: SpriteActionsParams) => {
  const { refreshExtracted } = params;
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = useCallback(async (romFile: string): Promise<CreateOutcome> => {
    setBusy(true); setError(null);
    const result = await spritesStore.extractSprites(romFile);
    setBusy(false);
    if (!result.success) return { success: false, error: result.error ?? t('data-manager:sprite-manager.extract-failed') };
    await refreshExtracted();
    return { success: true, id: romFile };
  }, [refreshExtracted, t]);

  const handleDelete = useCallback(async (romFile: string) => {
    setBusy(true); setError(null);
    const result = await spritesStore.deleteSprites(romFile);
    setBusy(false);
    if (result.success) {
      await refreshExtracted();
    } else {
      setError(result.error ?? t('data-manager:sprite-manager.delete-failed'));
    }
  }, [refreshExtracted, t]);

  return { busy, error, handleExtract, handleDelete };
};

export { useSpriteActions };
