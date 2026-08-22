/* @layer renderer-components @kind hook */
/**
 * Turns the effective manifest plus the pack's audio files into the rows the panel draws.
 *
 * Every vanilla slot is listed whether or not it is filled, because an empty slot is the thing
 * a user needs to see in order to fill it; extended slots only appear once the pack has one, so
 * a standard pack is not buried under empty rows.
 */
import { useMemo } from 'react';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { DELUXE_TRACK_THRESHOLD } from '@shared/types/msu-manifest';
import { detectMsuPackProfile } from '@shared/features/msu-auto-config';
import type { SelectOption } from '@ds/primitives/Select';
import { formatBytes } from '@app/utils/formatBytes';
import { MSU_TRACK_DESCRIPTIONS } from '../msu-track-descriptions';
import { extensionOf } from './track-file-name';
import type { MatchedTrack, MsuFile } from '../msu.type';

const describe = (trackNum: number): string => MSU_TRACK_DESCRIPTIONS[trackNum] ?? `Track ${trackNum}`;

const useTrackRows = (manifest: MsuPackManifest, files: MsuFile[]) => {
  const byTrack = useMemo(() => new Map(manifest.tracks.map((t) => [t.trackNum, t])), [manifest]);

  const rows = useMemo((): MatchedTrack[] => {
    const numbers = new Set<number>(Object.keys(MSU_TRACK_DESCRIPTIONS).map(Number).filter((n) => n < DELUXE_TRACK_THRESHOLD));
    for (const track of manifest.tracks) numbers.add(track.trackNum);
    return [...numbers].sort((a, b) => a - b).map((trackNum) => {
      const layers = byTrack.get(trackNum)?.layers ?? [];
      return {
        trackNum,
        description: describe(trackNum),
        fileName: layers[0]?.files[0] ?? null,
        layerCount: layers.length,
      };
    });
  }, [manifest, byTrack]);

  const referenced = useMemo(
    () => new Set(manifest.tracks.flatMap((t) => t.layers.flatMap((l) => l.files))),
    [manifest],
  );

  const unusedFiles = useMemo(() => files.filter((f) => !referenced.has(f.name)), [files, referenced]);

  const fileOptions = useMemo((): SelectOption[] => [
    { value: '', label: '(none)' },
    ...files.map((f) => ({ value: f.name, label: f.name, description: formatBytes(f.size) })),
  ], [files]);

  const profile = useMemo(() => detectMsuPackProfile(
    manifest.tracks.flatMap((t) => t.layers.flatMap((l) => l.files.map((f) => ({ trackNum: t.trackNum, ext: extensionOf(f) })))),
  ), [manifest]);

  return { rows, unusedFiles, fileOptions, isDeluxe: profile.isDeluxe, hasOpuz: profile.hasOpuz };
};

export { useTrackRows };
