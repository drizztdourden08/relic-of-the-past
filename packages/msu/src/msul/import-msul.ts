/* @layer shared-storage @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';
import { MSUL_MANIFEST_NAME } from '@rotp/hub-contracts';
import { isZip, unzip } from '@rotp/roms';
import type { ArchiveEntry } from '@rotp/roms';
import type { MsulPack } from './import-msul.type';

const isManifestShape = (value: unknown): value is MsuPackManifest => {
  if (typeof value !== 'object' || value === null) return false;
  const manifest = value as MsuPackManifest;
  return Boolean(manifest.meta) && typeof manifest.meta.name === 'string'
    && Array.isArray(manifest.tracks);
};

const parsePackJson = (text: string): MsuPackManifest => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`This pack's ${MSUL_MANIFEST_NAME} is not valid JSON. The file may be damaged.`);
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
    throw new Error('That file is not a layered MSU pack. A .msul file is an archive, and this one is not.');
  }

  let entries: ArchiveEntry[];
  try {
    entries = await unzip(bytes);
  } catch {
    throw new Error('This pack could not be opened. The archive appears to be incomplete or damaged.');
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
