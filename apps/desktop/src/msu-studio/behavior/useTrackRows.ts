/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { MsuPackManifest } from '@rotp/game-data';
import { VANILLA_TRACK_COUNT } from '@rotp/hub-contracts';
import { DELUXE_TRACKS, msuTrackName } from '@rotp/game-data';
import { detectMsuPackProfile } from '@rotp/features';
import type { SelectOption } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@drizztdourden08/brock-core';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { useT } from '@drizztdourden08/brock-react';
import { extensionOf } from './track-file-name';
import type { MatchedTrack, MsuFile } from '../msu.type';

const describe = (t: I18n['t'], trackNum: number): string =>
  msuTrackName(trackNum) ?? t('msu-studio:track.default-name', { number: trackNum });

const fileEntriesOf = (manifest: MsuPackManifest) =>
  manifest.tracks.flatMap((t) => t.layers.flatMap((l) => l.files.map((f) => ({ trackNum: t.trackNum, ext: extensionOf(f) }))));

const useTrackRows = (manifest: MsuPackManifest, files: MsuFile[]) => {
  const t = useT();
  const byTrack = useMemo(() => new Map(manifest.tracks.map((t) => [t.trackNum, t])), [manifest]);

  const profile = useMemo(() => detectMsuPackProfile(fileEntriesOf(manifest)), [manifest]);

  const extended = profile.isDeluxe;

  const rows = useMemo((): MatchedTrack[] => {
    const numbers = new Set<number>();
    for (let trackNum = 1; trackNum <= VANILLA_TRACK_COUNT; trackNum += 1) numbers.add(trackNum);
    if (extended) for (const trackNum of DELUXE_TRACKS) numbers.add(trackNum);
    return [...numbers].sort((a, b) => a - b).map((trackNum) => {
      const layers = byTrack.get(trackNum)?.layers ?? [];
      return {
        trackNum,
        description: describe(t, trackNum),
        fileName: layers[0]?.files[0] ?? null,
        layerCount: layers.length,
      };
    });
  }, [t, byTrack, extended]);

  const referenced = useMemo(
    () => new Set(manifest.tracks.flatMap((t) => t.layers.flatMap((l) => l.files))),
    [manifest],
  );

  const unusedFiles = useMemo(() => files.filter((f) => !referenced.has(f.name)), [files, referenced]);

  const fileOptions = useMemo((): SelectOption[] => [
    { value: '', label: t('msu-studio:track.file.none') },
    ...files.map((f) => ({ value: f.name, label: f.name, description: formatBytes(f.size) })),
  ], [t, files]);

  return { rows, unusedFiles, fileOptions, isDeluxe: extended, hasOpuz: profile.hasOpuz };
};

export { useTrackRows };
