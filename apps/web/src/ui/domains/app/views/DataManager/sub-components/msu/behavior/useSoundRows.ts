/* @layer renderer-components @kind hook */
/**
 * One channel's catalogue crossed with what the pack authors. Replaced rows are lifted to the top.
 *
 * EFFECTS channels list every id, not only the named ones: the catalogue reads the game's source
 * and cannot see an id picked from a table at runtime (the sword beam by sword level). The
 * AMBIENT channel defaults to the ids the game can reach (see `ambient-reach.ts`); nothing can
 * raise the rest, so they stay a toggle away, except that a claimed row is always listed.
 */
import { useMemo } from 'react';
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import { soundsOfChannel, soundName } from '@shared/game/data/game-sounds';
import { ambientRole, isAmbientReachable } from '@shared/game/data/ambient-reach';
import { SOUND_ID_COUNT } from '@shared/types/msu-manifest';
import { soundDefsOfChannel } from './sound-manifest';
import { soundHexId } from '../sound-labels';
import type { SoundRowData } from '../msu.type';

const matches = (row: SoundRowData, query: string): boolean =>
  row.hex.toLowerCase().includes(query)
  || String(row.soundId).includes(query)
  || (row.label ?? '').toLowerCase().includes(query)
  || row.triggers.some((trigger) => trigger.toLowerCase().includes(query));

/** Only the ambient channel has a reachable set; the effects channels choose ids at runtime. */
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
    // The rest of the range, in id order after the named ones. Id 0 is "nothing to play", not a sound.
    const rest: SoundRowData[] = [];
    for (let id = 1; id < SOUND_ID_COUNT; id++) {
      if (known.has(id)) continue;
      rest.push({
        soundId: id,
        hex: soundHexId(id),
        // Named even with no call site: an id the generator cannot see (one picked from a table at
        // runtime) is exactly the case where a documented name is the only description there is.
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

  // What the tab offers at all. A claimed row survives the trim: taking someone's existing work
  // out of the UI would leave them no way back to it.
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
    // Stable, so the catalogue's busiest-first order survives inside each group.
    return [...kept].sort((a, b) => Number(b.layerCount > 0) - Number(a.layerCount > 0));
  }, [listed, filter]);

  const replacedCount = useMemo(() => listed.filter((row) => row.layerCount > 0).length, [listed]);
  // How many listed ids the game's own code raises; said once at the top instead of on fifty rows.
  const raisedCount = useMemo(() => listed.filter((row) => row.sites > 0).length, [listed]);
  const reachableCount = useMemo(() => listed.filter((row) => !row.unreachable).length, [listed]);
  // Over the whole range, so the count the toggle offers does not change once it is on.
  const unreachableCount = useMemo(() => all.filter((row) => row.unreachable).length, [all]);

  return {
    rows, ids, replacedCount, raisedCount, reachableCount, unreachableCount,
    total: listed.length, hiddenCount: all.length - listed.length,
  };
};

export { useSoundRows };
