/* @layer renderer-components @kind hook */
import { useState, useEffect } from 'react';
import * as spritesStore from '@app/storage/sprites-store';

const useSpriteBaseUrl = (selectedRom: string): string | null => {
  const [spriteBaseUrl, setSpriteBaseUrl] = useState<string | null>(null);

  useEffect(() => {
    setSpriteBaseUrl(null);
    if (!selectedRom) return;
    let cancelled = false;
    void spritesStore.getSpritesBaseUrl(selectedRom).then((u) => { if (!cancelled && u) setSpriteBaseUrl(u); });
    return () => { cancelled = true; };
  }, [selectedRom]);

  return spriteBaseUrl;
};

export { useSpriteBaseUrl };
