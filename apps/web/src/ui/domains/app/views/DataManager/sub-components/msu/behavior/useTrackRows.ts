/* @layer renderer-components @kind hook */
/**
 * Turns the effective manifest plus the pack's audio files into the rows the panel draws.
 *
 * Every vanilla slot is listed whether or not it is filled, because an empty slot is the thing
 * a user needs to see in order to fill it; the extended slots join them only for a pack that
 * carries extended tracks, so a standard pack is not buried under empty rows.
 *
 * What is NOT listed is a number the game cannot ask for. A pack may ship a file for any number
 * it likes — packs in the wild do — but if neither the vanilla range nor the extended tables ever
 * request it, it is not a slot: it is a file that will never be heard. Listing it puts a row in
 * front of someone that they can fill and never hear the result of. Those files are not hidden;
 * they show in the pack's file list, where nothing claims them and they read as unused.
 */
import { useMemo } from 'react';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { VANILLA_TRACK_COUNT } from '@shared/types/msu-manifest';
import { DELUXE_TRACKS } from '@shared/game/data/msu-deluxe-remap';
import { detectMsuPackProfile } from '@shared/features/msu-auto-config';
import type { SelectOption } from '@ds/primitives/Select';
import { formatBytes } from '@app/utils/formatBytes';
import { msuTrackName } from '@shared/game/data/msu-track-names';
import { extensionOf } from './track-file-name';
import type { MatchedTrack, MsuFile } from '../msu.type';

const describe = (trackNum: number): string => msuTrackName(trackNum) ?? `Track ${trackNum}`;

const useTrackRows = (manifest: MsuPackManifest, files: MsuFile[]) => {
  const byTrack = useMemo(() => new Map(manifest.tracks.map((t) => [t.trackNum, t])), [manifest]);

  const profile = useMemo(() => detectMsuPackProfile(
    manifest.tracks.flatMap((t) => t.layers.flatMap((l) => l.files.map((f) => ({ trackNum: t.trackNum, ext: extensionOf(f) })))),
  ), [manifest]);

  const extended = profile.isDeluxe;

  const rows = useMemo((): MatchedTrack[] => {
    // The vanilla range is a property of the FORMAT, so it is counted out here rather than taken
    // from the name dataset. Deriving it from the names would empty the whole list on a checkout
    // without vault access, turning missing names into missing tracks.
    //
    // It stops at the last real song id. Anything the pack itself carries beyond that is added
    // below, so an extended pack still lists every slot it ships without inventing the two that
    // sit in the gap between the vanilla range and the extended one.
    const numbers = new Set<number>();
    for (let trackNum = 1; trackNum <= VANILLA_TRACK_COUNT; trackNum += 1) numbers.add(trackNum);
    // The extended slots come from the tables, not from what the pack happens to hold, so an
    // extended pack shows every slot it COULD fill rather than only the ones it already has.
    if (extended) for (const trackNum of DELUXE_TRACKS) numbers.add(trackNum);
    return [...numbers].sort((a, b) => a - b).map((trackNum) => {
      const layers = byTrack.get(trackNum)?.layers ?? [];
      return {
        trackNum,
        description: describe(trackNum),
        fileName: layers[0]?.files[0] ?? null,
        layerCount: layers.length,
      };
    });
  }, [byTrack, extended]);

  const referenced = useMemo(
    () => new Set(manifest.tracks.flatMap((t) => t.layers.flatMap((l) => l.files))),
    [manifest],
  );

  const unusedFiles = useMemo(() => files.filter((f) => !referenced.has(f.name)), [files, referenced]);

  const fileOptions = useMemo((): SelectOption[] => [
    { value: '', label: '(none)' },
    ...files.map((f) => ({ value: f.name, label: f.name, description: formatBytes(f.size) })),
  ], [files]);

  return { rows, unusedFiles, fileOptions, isDeluxe: extended, hasOpuz: profile.hasOpuz };
};

export { useTrackRows };
