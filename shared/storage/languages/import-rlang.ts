/* @layer shared-storage @kind logic */
/**
 * Reads a `.rlang` archive into a new language set folder, the inverse of ./export-rlang.
 *
 * The set always lands under a free id of its own, so an import never writes over a set that
 * is already there. `set.json` is written LAST: until it exists the folder is not listed as a
 * set, so a run that dies part way through leaves nothing the app would try to open. The
 * written set is then read back through the ordinary reader, and a set that does not open is
 * removed again.
 *
 * Every failure is something a user did (picked the wrong file, edited one by hand), so each
 * one throws a message written for them.
 */
import type { FileStore } from '@shared/platform';
import { isZip, unzip } from '../archive';
import type { ArchiveEntry } from '../archive';
import { writeJson } from '../json';
import { getSet, getSetFont } from './read';
import { ACCEPTED_PAYLOAD, REQUIRED_PAYLOAD, RLANG_HEADER_ENTRY, isSetHeader } from './rlang-format';
import type { SetHeader } from './rlang-format';
import { SET_FILES, setFilePath, setMetaPath } from './paths';
import { pickFreeSetId } from './set-id';
import { remove } from './write';

interface RlangImportOptions {
  /** Id to aim for; the archive's own id when absent. A taken id gets a numbered suffix. */
  desiredId?: string;
  /** Called after each file is written. */
  onProgress?: (done: number, total: number) => void;
}

interface RlangImportResult {
  id: string;
  name: string;
}

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

/** The reader falls back to an empty list on bad JSON, so the dialogue is checked here, before it lands. */
const isJsonArray = (entry: ArchiveEntry | undefined): boolean => {
  if (!entry) return false;
  try {
    return Array.isArray(JSON.parse(new TextDecoder().decode(entry.bytes)));
  } catch {
    return false;
  }
};

/** The payload entries this build writes, first occurrence of each name, checked for completeness. */
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
