/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import type { MsuFileMetadata } from '@rotp/msu';
import * as msuStore from '@app/storage/msu-store';
import type { MsuFile } from '../msu.type';

const usePackMetadata = (pack: string, files: MsuFile[]) => {
  const [metadata, setMetadata] = useState<MsuFileMetadata[]>([]);
  const [settledPack, setSettledPack] = useState<string | null>(null);

  useEffect(() => {
    if (files.length === 0) { setMetadata([]); setSettledPack(pack); return undefined; }
    let live = true;
    void msuStore.getMsuFileMetadata(pack)
      .then((list) => { if (live) { setMetadata(list); setSettledPack(pack); } })
      .catch(() => { if (live) { setMetadata([]); setSettledPack(pack); } });
    return () => { live = false; };
  }, [pack, files]);

  return { metadata, settledPack };
};

export { usePackMetadata };
