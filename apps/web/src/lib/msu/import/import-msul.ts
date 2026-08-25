/* @layer renderer-lib @kind logic */
/**
 * Reads a `.msul` pack back into a manifest and its files — the exact inverse of
 * ../export/export-msul, so a pack exported and re-imported is the pack you started with.
 *
 * Every failure here is something a user did (picked the wrong file, hand-edited a manifest,
 * carries a pack from a newer build), so each one throws a message written for them rather than
 * for a log. The validation is spelled out instead of delegated to storage's `parseManifest`,
 * which collapses every cause into null and could only produce one generic message.
 */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { MSUL_MANIFEST_NAME } from '@shared/types/msu-manifest';
import { isZip, unzip } from '@shared/storage/archive';
import type { ArchiveEntry } from '@shared/storage/archive';

interface MsulPack {
  manifest: MsuPackManifest;
  /** Every non-manifest entry, in archive order. */
  files: ArchiveEntry[];
}

/** The shape check the format's own version guarantee rests on. */
const isManifestShape = (value: unknown): value is MsuPackManifest => {
  const manifest = value as MsuPackManifest | null;
  return !!manifest && typeof manifest === 'object'
    && !!manifest.meta && typeof manifest.meta.name === 'string'
    && Array.isArray(manifest.tracks);
};

const parsePackJson = (text: string): MsuPackManifest => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`This pack's ${MSUL_MANIFEST_NAME} is not valid JSON — the file may be damaged.`);
  }

  const version = (parsed as { version?: unknown } | null)?.version;
  if (version !== 1) {
    throw new Error(
      `This pack declares format version ${String(version ?? 'unknown')}, which this version of the app cannot read.`,
    );
  }
  if (!isManifestShape(parsed)) {
    throw new Error(`This pack's ${MSUL_MANIFEST_NAME} is missing its pack details or track list.`);
  }
  return parsed;
};

const readMsulPack = async (bytes: Uint8Array): Promise<MsulPack> => {
  if (!isZip(bytes)) {
    throw new Error('That file is not a layered MSU pack — a .msul file is an archive, and this one is not.');
  }

  let entries: ArchiveEntry[];
  try {
    entries = await unzip(bytes);
  } catch {
    throw new Error('This pack could not be opened — the archive appears to be incomplete or damaged.');
  }

  const manifestEntry = entries.find((entry) => entry.name === MSUL_MANIFEST_NAME);
  if (!manifestEntry) {
    throw new Error(`This archive has no ${MSUL_MANIFEST_NAME}, so it is not a layered MSU pack.`);
  }

  return {
    manifest: parsePackJson(new TextDecoder().decode(manifestEntry.bytes)),
    files: entries.filter((entry) => entry !== manifestEntry),
  };
};

export { readMsulPack };
export type { MsulPack };
