/* @layer shared-store @kind logic */
/**
 * Turns a pack's first entry into the facts an item shows, through the same guards the app
 * uses to open each container. null means the app could not open it: the entry has the wrong
 * name for the container, or its manifest fails that container's guard.
 */
import { DELUXE_TRACK_THRESHOLD } from '@shared/types/msu-manifest';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { parseManifest } from '@shared/storage/msu-edit';
import { isRspManifest } from '@shared/storage/link-sprites/parse-rsp';
import { isSetHeader } from '@shared/storage/languages/rlang-format';
import { CONTAINER_MANIFEST } from '../containers';
import type { Container, KindFacts } from '../types';
import type { FirstEntry } from './read-first-entry';

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

const characterFacts = ({ manifest }: FirstEntry): KindFacts | null => (isRspManifest(manifest)
  ? { kind: 'character', title: manifest.meta.name ?? '', author: manifest.meta.author ?? '' }
  : null);

const languageFacts = ({ manifest }: FirstEntry): KindFacts | null => (isSetHeader(manifest)
  ? { kind: 'language', title: manifest.name, base: manifest.base, origin: manifest.origin }
  : null);

const FACTS: Record<Container, (entry: FirstEntry) => KindFacts | null> = {
  msul: musicFacts,
  rsp: characterFacts,
  rlang: languageFacts,
};

const factsFor = (container: Container, entry: FirstEntry): KindFacts | null =>
  (entry.name === CONTAINER_MANIFEST[container] ? FACTS[container](entry) : null);

export { factsFor };
