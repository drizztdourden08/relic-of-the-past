/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import { useImportProgress } from '@app/hooks/useImportProgress';
import { extractSpritesIfMissing } from './extract-sprites-if-missing';
import type { UseRomExtractionParams } from './rom-extraction.type';

const useRomExtraction = (params: UseRomExtractionParams) => {
  const { onExtractAssets } = params;
  const [withSprites, setWithSprites] = useState(true);
  const [spriteError, setSpriteError] = useState<string | null>(null);
  const spriteProgress = useImportProgress('sprite');

  const extract = useCallback(async (romFile: string) => {
    setSpriteError(null);
    const assetsReady = await onExtractAssets(romFile);
    if (assetsReady && withSprites) setSpriteError(await extractSpritesIfMissing(romFile));
    return assetsReady;
  }, [onExtractAssets, withSprites]);

  return { withSprites, setWithSprites, spriteError, spriteProgress, extract };
};

export { useRomExtraction };
