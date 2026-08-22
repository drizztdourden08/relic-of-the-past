/* @layer renderer-components @kind hook */
/**
 * Everything the detail panel knows about the selected pack: its audio files, its numbered
 * slots, and its manifest. `reload` is exposed because every editing action changes what is on
 * disk and the panel has to re-read rather than guess.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import * as msuStore from '@app/lib/storage/msu-store';
import { effectiveManifest } from './pack-manifest';
import { getTrackNumber } from '../msu.type';
import type { MsuFile, TrackInfo } from '../msu.type';

const usePackContents = (pack: string | null) => {
  const [files, setFiles] = useState<MsuFile[]>([]);
  const [trackInfos, setTrackInfos] = useState<TrackInfo[]>([]);
  const [manifest, setManifest] = useState<MsuPackManifest | null>(null);
  const [loading, setLoading] = useState(false);
  const [generation, setGeneration] = useState(0);

  const reload = useCallback(() => { setGeneration((n) => n + 1); }, []);

  useEffect(() => {
    if (!pack) { setFiles([]); setTrackInfos([]); setManifest(null); return; }
    let live = true;
    setLoading(true);
    Promise.all([
      msuStore.listMsuAudioFiles(pack),
      msuStore.getMsuTrackList(pack),
      msuStore.readMsuManifest(pack),
    ]).then(([audio, tracks, packManifest]) => {
      if (!live) return;
      setFiles([...audio].sort((a, b) => (getTrackNumber(a.name) ?? 999) - (getTrackNumber(b.name) ?? 999)));
      setTrackInfos([...tracks].sort((a, b) => a.trackNum - b.trackNum));
      setManifest(packManifest);
      setLoading(false);
    }).catch(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [pack, generation]);

  const resolved = useMemo(
    () => effectiveManifest(pack ?? '', manifest, trackInfos),
    [pack, manifest, trackInfos],
  );

  const totalSize = useMemo(() => files.reduce((sum, f) => sum + f.size, 0), [files]);

  return { files, trackInfos, manifest, resolved, totalSize, loading, reload };
};

export { usePackContents };
