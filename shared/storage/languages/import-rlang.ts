/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { isZip, unzip } from '@rotp/roms';
import type { ArchiveEntry } from '@rotp/roms';
import { writeJson } from '@drizztdourden08/brock-core';
import { getSet, getSetFont } from './read';
import { ACCEPTED_PAYLOAD, REQUIRED_PAYLOAD, RLANG_HEADER_ENTRY, isSetHeader } from './rlang-format';
import type { SetHeader } from './rlang-format';
import { SET_FILES, setFilePath, setMetaPath } from './paths';
import type { RlangImportOptions, RlangImportResult } from './import-rlang.type';
import { pickFreeSetId } from './set-id';
import { remove } from './write';

const readEntries = async (bytes: Uint8Array): Promise<ArchiveEntry[]> => {
  if (!isZip(bytes)) throw new Error('That file is not a language set. A .rlang file is an archive, and this one is not.');
  try {
    return await unzip(bytes);
  } catch {
    throw new Error('This language set could not be opened. The archive appears to be incomplete or damaged.');
  }
};

const parseHeader = (entry: ArchiveEntry | undefined): SetHeader => {
  if (!entry) throw new Error(`This archive has no ${RLANG_HEADER_ENTRY}, so it is not a language set.`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(entry.bytes));
  } catch {
    throw new Error(`This set's ${RLANG_HEADER_ENTRY} is not valid JSON. The file may be damaged.`);
  }
  if (!isSetHeader(parsed)) {
    throw new Error(`This set's ${RLANG_HEADER_ENTRY} names a language or format this version of the app cannot read.`);
  }
  return parsed;
};

const isJsonArray = (entry: ArchiveEntry | undefined): boolean => {
  if (!entry) return false;
  try {
    return Array.isArray(JSON.parse(new TextDecoder().decode(entry.bytes)));
  } catch {
    return false;
  }
};

const payloadOf = (entries: ArchiveEntry[]): ArchiveEntry[] => {
  const byName = new Map<string, ArchiveEntry>();
  for (const entry of entries) {
    if (ACCEPTED_PAYLOAD.has(entry.name) && !byName.has(entry.name)) byName.set(entry.name, entry);
  }
  const missing = REQUIRED_PAYLOAD.filter((name) => !byName.has(name));
  if (missing.length > 0) throw new Error(`This language set is missing ${missing.join(', ')}.`);
  if (!isJsonArray(byName.get(SET_FILES.dialogue))) {
    throw new Error(`This set's ${SET_FILES.dialogue} is not a list of lines. The file may be damaged.`);
  }
  return [...byName.values()];
};

const assertOpens = async (files: FileStore, id: string): Promise<void> => {
  if ((await getSet(files, id)) && (await getSetFont(files, id))) return;
  await remove(files, id);
  throw new Error('This language set was unpacked but could not be opened, so it was not kept.');
};

const importRlang = async (
  files: FileStore, bytes: Uint8Array, options: RlangImportOptions = {},
): Promise<RlangImportResult> => {
  const { desiredId, onProgress } = options;
  const entries = await readEntries(bytes);
  const header = parseHeader(entries.find((entry) => entry.name === RLANG_HEADER_ENTRY));
  const payload = payloadOf(entries);
  const id = await pickFreeSetId(files, desiredId || header.id);

  const total = payload.length + 1;
  for (const [index, entry] of payload.entries()) {
    await files.writeBytes(setFilePath(id, entry.name), entry.bytes);
    onProgress?.(index + 1, total);
  }
  await writeJson(files, setMetaPath(id), { ...header, id });
  onProgress?.(total, total);

  await assertOpens(files, id);
  return { id, name: header.name };
};

export { importRlang };
export type { RlangImportOptions, RlangImportResult };
