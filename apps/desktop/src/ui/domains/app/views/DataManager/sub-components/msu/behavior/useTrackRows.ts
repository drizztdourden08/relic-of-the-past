/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { VANILLA_TRACK_COUNT } from '@shared/types/msu-manifest';
import { DELUXE_TRACKS } from '@rotp/game-data';
import { detectMsuPackProfile } from '@shared/features/msu-auto-config';
import type { SelectOption } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import { msuTrackName } from '@rotp/game-data';
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
    const numbers = new Set<number>();
    for (let trackNum = 1; trackNum <= VANILLA_TRACK_COUNT; trackNum += 1) numbers.add(trackNum);
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
