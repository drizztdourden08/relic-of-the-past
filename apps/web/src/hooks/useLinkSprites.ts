/* @layer renderer-hooks @kind logic */
/** Loads the global custom Link sprite (.zspr) library with decoded standing-Link previews. */
import { useState, useEffect, useCallback } from 'react';
import { listLinkSprites, readLinkSprite } from '@app/lib/storage/link-sprites-store';
import { decodeZsprPreview } from '@app/lib/game/zspr';

interface LinkSpriteEntry {
  name: string; // filename, e.g. "green-tunic.zspr"
  preview: string | null; // PNG data URL of the standing frame
}

const useLinkSprites = () => {
  const [sprites, setSprites] = useState<LinkSpriteEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const names = await listLinkSprites();
    const loaded = await Promise.all(
      names.map(async (name) => {
        const bytes = await readLinkSprite(name);
        return { name, preview: bytes ? decodeZsprPreview(bytes) : null };
      }),
    );
    setSprites(loaded);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { sprites, loading, refresh };
};

export { useLinkSprites };
export type { LinkSpriteEntry };
