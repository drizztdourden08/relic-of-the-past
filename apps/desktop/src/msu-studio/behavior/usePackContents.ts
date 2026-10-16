/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MsuPackManifest } from '@rotp/game-data';
import * as msuStore from '@app/storage/msu-store';
import { effectiveManifest } from './pack-manifest';
import { getTrackNumber } from './get-track-number';
import type { MsuFile, TrackInfo } from '../msu.type';

const usePackContents = (pack: string | null) => {
  const [files, setFiles] = useState<MsuFile[]>([]);
  const [trackInfos, setTrackInfos] = useState<TrackInfo[]>([]);
  const [manifest, setManifest] = useState<MsuPackManifest | null>(null);
  const [loadedPack, setLoadedPack] = useState<string | null>(null);
  const [generation, setGeneration] = useState(0);

  const reload = useCallback(() => { setGeneration((n) => n + 1); }, []);

  useEffect(() => {
    if (!pack) { setFiles([]); setTrackInfos([]); setManifest(null); setLoadedPack(null); return; }
    let live = true;
    Promise.all([
      msuStore.listMsuAudioFiles(pack),
      msuStore.getMsuTrackList(pack),
      msuStore.readMsuManifest(pack),
    ]).then(([audio, tracks, packManifest]) => {
      if (!live) return;
      setFiles([...audio].sort((a, b) => (getTrackNumber(a.name) ?? 999) - (getTrackNumber(b.name) ?? 999)));
      setTrackInfos([...tracks].sort((a, b) => a.trackNum - b.trackNum));
      setManifest(packManifest);
      setLoadedPack(pack);
    }).catch(() => {
      if (!live) return;
      setFiles([]); setTrackInfos([]); setManifest(null);
      setLoadedPack(pack);
    });
    return () => { live = false; };
  }, [pack, generation]);

  const resolved = useMemo(
    () => effectiveManifest(pack ?? '', manifest, trackInfos),
    [pack, manifest, trackInfos],
  );

  const totalSize = useMemo(() => files.reduce((sum, f) => sum + f.size, 0), [files]);

  return { files, trackInfos, manifest, resolved, totalSize, loaded: pack === null || loadedPack === pack, reload };
};

export { usePackContents };
