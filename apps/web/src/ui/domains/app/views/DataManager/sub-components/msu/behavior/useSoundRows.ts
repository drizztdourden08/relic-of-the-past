/* @layer renderer-components @kind hook */
/**
 * The catalogue of one channel's sounds crossed with what the pack authors.
 *
 * Every sound the channel can raise is listed, native ones included, because an unclaimed id is
 * exactly the thing someone needs to see in order to claim it. Replaced ones are lifted to the
 * top: an effects channel has fifty-odd ids, and what the pack actually does should not have to
 * be hunted for among them.
 *
 * Every id the channel can carry gets a row, not only the ones the catalogue names. The catalogue
 * is built by reading the game's own source, so it can only see a sound whose id is written there
 * as a literal — one picked from a table at runtime (the sword beam by sword level, for instance)
 * is invisible to it. Listing the whole range is what makes the promise "any sound in the game can
 * be replaced" true rather than "any sound we managed to name".
 */
import { useMemo } from 'react';
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import { soundsOfChannel, soundName } from '@shared/game/data/game-sounds';
import { SOUND_ID_COUNT } from '@shared/types/msu-manifest';
import { soundDefsOfChannel } from './sound-manifest';
import { soundHexId } from '../sound-labels';
import type { SoundRowData } from '../msu.type';

const matches = (row: SoundRowData, query: string): boolean =>
  row.hex.toLowerCase().includes(query)
  || String(row.soundId).includes(query)
  || (row.label ?? '').toLowerCase().includes(query)
  || row.triggers.some((trigger) => trigger.toLowerCase().includes(query));

const useSoundRows = (manifest: MsuPackManifest, channel: SoundChannel, filter: string) => {
  const byId = useMemo(
    () => new Map(soundDefsOfChannel(manifest, channel).map((def) => [def.soundId, def])),
    [manifest, channel],
  );

  const all = useMemo((): SoundRowData[] => {
    const listed = soundsOfChannel(channel).map((sound): SoundRowData => ({
      soundId: sound.id,
      hex: soundHexId(sound.id),
      label: sound.label ?? null,
      triggers: sound.triggers,
      sites: sound.sites,
      layerCount: byId.get(sound.id)?.layers.length ?? 0,
      unlisted: false,
    }));
    const known = new Set(listed.map((row) => row.soundId));
    // The rest of the range, in id order after the named ones. Id 0 is the game's "nothing to
    // play" write rather than a sound, so it is not one of these.
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
      });
    }
    return [...listed, ...rest];
  }, [channel, byId]);

  const ids = useMemo(() => all.map((row) => row.soundId), [all]);

  const rows = useMemo(() => {
    const query = filter.trim().toLowerCase();
    const kept = query.length > 0 ? all.filter((row) => matches(row, query)) : all;
    // Stable, so the catalogue's busiest-first order survives inside each group.
    return [...kept].sort((a, b) => Number(b.layerCount > 0) - Number(a.layerCount > 0));
  }, [all, filter]);

  const replacedCount = useMemo(() => all.filter((row) => row.layerCount > 0).length, [all]);
  // How many of the range the game's own code actually raises. The rest are ids the channel can
  // carry — replaceable, but nothing in the game asks for them, which is worth saying once at the
  // top of the tab instead of on fifty rows.
  const raisedCount = useMemo(() => all.filter((row) => row.sites > 0).length, [all]);

  return { rows, ids, replacedCount, raisedCount, total: all.length };
};

export { useSoundRows };
