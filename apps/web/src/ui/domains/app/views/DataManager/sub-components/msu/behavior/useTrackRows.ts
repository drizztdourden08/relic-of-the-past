/* @layer renderer-components @kind hook */
/**
 * Every vanilla slot is listed, filled or not; extended slots join only for an extended pack. A
 * number the game never asks for is NOT a slot, so such files show only in the file list as unused.
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
    // The vanilla range is a property of the FORMAT, not the name dataset: a checkout without vault
    // access would otherwise turn missing names into missing tracks.
    const numbers = new Set<number>();
    for (let trackNum = 1; trackNum <= VANILLA_TRACK_COUNT; trackNum += 1) numbers.add(trackNum);
    // Extended slots come from the tables, so an extended pack shows every slot it COULD fill.
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
