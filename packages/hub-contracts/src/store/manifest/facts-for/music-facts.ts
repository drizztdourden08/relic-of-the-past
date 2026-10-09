/* @layer shared-store @kind logic */
import { DELUXE_TRACK_THRESHOLD } from '../../../manifest';
import type { MsuPackManifest } from '../../../manifest';
import { parseManifest } from '../../../edit/parse-manifest';
import type { KindFacts } from '../../types';
import type { FirstEntry } from '../read-first-entry';

const soundCountOf = (manifest: MsuPackManifest): number =>
  Object.values(manifest.sounds ?? {}).reduce((sum, defs) => sum + (defs?.length ?? 0), 0);

const musicFacts = (entry: FirstEntry): KindFacts | null => {
  const manifest = parseManifest(entry.text);
  if (!manifest) return null;
  return {
    kind: 'music',
    title: manifest.meta.name,
    trackCount: manifest.tracks.length,
    soundCount: soundCountOf(manifest),
    fileCount: manifest.files?.length ?? null,
    deluxe: manifest.tracks.some((track) => track.trackNum >= DELUXE_TRACK_THRESHOLD),
  };
};

export { musicFacts };
