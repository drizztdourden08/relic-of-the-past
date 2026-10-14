/* @layer renderer-components @kind hook */
import { useState, useEffect } from 'react';
import * as spritesStore from '@app/storage/sprites-store';

const useSpriteBaseUrl = (selectedRom: string): string => {
  const [spriteBaseUrl, setSpriteBaseUrl] = useState('');

  useEffect(() => {
    if (!selectedRom) { setSpriteBaseUrl(''); return; }
    let cancelled = false;
    void spritesStore.getSpritesBaseUrl(selectedRom).then((u) => { if (!cancelled) setSpriteBaseUrl(u); });
    return () => { cancelled = true; };
  }, [selectedRom]);

  return spriteBaseUrl;
};

export { useSpriteBaseUrl };
