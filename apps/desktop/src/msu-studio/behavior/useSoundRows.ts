/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { useText } from '@drizztdourden08/brock-react';
import type { MsuPackManifest, SoundChannel } from '@rotp/game-data';
import { soundDefsOfChannel } from './sound-manifest';
import { buildSoundRows } from './build-sound-rows';
import type { SoundRowData } from '../msu.type';

const matches = (row: SoundRowData, query: string): boolean =>
  row.hex.toLowerCase().includes(query)
  || String(row.soundId).includes(query)
  || (row.label ?? '').toLowerCase().includes(query)
  || row.triggers.some((trigger) => trigger.toLowerCase().includes(query));

const useSoundRows = (
  manifest: MsuPackManifest,
  channel: SoundChannel,
  filter: string,
  includeUnreachable = false,
) => {
  const text = useText();
  const byId = useMemo(
    () => new Map(soundDefsOfChannel(manifest, channel).map((def) => [def.soundId, def])),
    [manifest, channel],
  );

  const all = useMemo(
    () => buildSoundRows(channel, (soundId) => byId.get(soundId)?.layers.length ?? 0, text),
    [channel, byId, text],
  );

  const listed = useMemo(
    () => (includeUnreachable
      ? all
      : all.filter((row) => !row.unreachable || row.layerCount > 0)),
    [all, includeUnreachable],
  );

  const ids = useMemo(() => listed.map((row) => row.soundId), [listed]);

  const rows = useMemo(() => {
    const query = filter.trim().toLowerCase();
    const kept = query.length > 0 ? listed.filter((row) => matches(row, query)) : listed;
    return [...kept].sort((a, b) => Number(b.layerCount > 0) - Number(a.layerCount > 0));
  }, [listed, filter]);

  const replacedCount = useMemo(() => listed.filter((row) => row.layerCount > 0).length, [listed]);
  const raisedCount = useMemo(() => listed.filter((row) => row.sites > 0).length, [listed]);
  const reachableCount = useMemo(() => listed.filter((row) => !row.unreachable).length, [listed]);
  const unreachableCount = useMemo(() => all.filter((row) => row.unreachable).length, [all]);

  return {
    rows, ids, replacedCount, raisedCount, reachableCount, unreachableCount,
    total: listed.length, hiddenCount: all.length - listed.length,
  };
};

export { useSoundRows };
