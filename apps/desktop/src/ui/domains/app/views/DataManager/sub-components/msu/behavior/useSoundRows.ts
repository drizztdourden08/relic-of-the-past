/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import { soundsOfChannel, soundName } from '@rotp/game-data';
import { ambientRole, isAmbientReachable } from '@rotp/game-data';
import { SOUND_ID_COUNT } from '@shared/types/msu-manifest';
import { soundDefsOfChannel } from './sound-manifest';
import { soundHexId } from '../sound-labels';
import { FIRST_PLAYABLE_ID } from './useSoundRows.constants';
import type { SoundRowData } from '../msu.type';

const matches = (row: SoundRowData, query: string): boolean =>
  row.hex.toLowerCase().includes(query)
  || String(row.soundId).includes(query)
  || (row.label ?? '').toLowerCase().includes(query)
  || row.triggers.some((trigger) => trigger.toLowerCase().includes(query));

const reachOf = (channel: SoundChannel, soundId: number) => ({
  role: channel === 'ambient' ? ambientRole(soundId) : null,
  unreachable: channel === 'ambient' && !isAmbientReachable(soundId),
});

const useSoundRows = (
  manifest: MsuPackManifest,
  channel: SoundChannel,
  filter: string,
  includeUnreachable = false,
) => {
  const byId = useMemo(
    () => new Map(soundDefsOfChannel(manifest, channel).map((def) => [def.soundId, def])),
    [manifest, channel],
  );

  const all = useMemo((): SoundRowData[] => {
    const named = soundsOfChannel(channel).map((sound): SoundRowData => ({
      soundId: sound.id,
      hex: soundHexId(sound.id),
      label: sound.label ?? null,
      triggers: sound.triggers,
      sites: sound.sites,
      layerCount: byId.get(sound.id)?.layers.length ?? 0,
      unlisted: false,
      ...reachOf(channel, sound.id),
    }));
    const known = new Set(named.map((row) => row.soundId));
    const rest: SoundRowData[] = [];
    for (let id = FIRST_PLAYABLE_ID; id < SOUND_ID_COUNT; id++) {
      if (known.has(id)) continue;
      rest.push({
        soundId: id,
        hex: soundHexId(id),
        label: soundName(channel, id),
        triggers: [],
        sites: 0,
        layerCount: byId.get(id)?.layers.length ?? 0,
        unlisted: true,
        ...reachOf(channel, id),
      });
    }
    return [...named, ...rest];
  }, [channel, byId]);

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
