/* @layer shared-storage @kind logic */
/**
 * Exports one language set as `.rlang`. The files go out exactly as they sit in the set's
 * folder, in a fixed order with the archive's fixed timestamp, so two exports of the same set
 * agree byte for byte. Everything is DEFLATE-d: a set is JSON plus two small font tables.
 */
import type { FileStore } from '@shared/platform';
import { zipEntries } from '../archive-write';
import type { ZipEntry } from '../archive-write';
import { formatOf } from './format-2';
import { migrateLegacySet } from './migrate';
import { setFilePath, setMetaPath } from './paths';
import { REQUIRED_PAYLOAD, RLANG_HEADER_ENTRY, isSetHeader, payloadNames } from './rlang-format';

const readHeader = async (files: FileStore, id: string): Promise<{ bytes: Uint8Array; format: number }> => {
  const bytes = await files.readBytes(setMetaPath(id));
  if (!bytes) throw new Error(`Language set "${id}" was not found.`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error(`Language set "${id}" has a damaged set.json.`);
  }
  if (!isSetHeader(parsed)) throw new Error(`Language set "${id}" has a set.json this version cannot export.`);
  return { bytes, format: formatOf(parsed) };
};

const exportRlang = async (files: FileStore, id: string): Promise<Uint8Array> => {
  if (!(await migrateLegacySet(files, id))) throw new Error(`Language set "${id}" was not found.`);
  const header = await readHeader(files, id);

  const entries: ZipEntry[] = [{ name: RLANG_HEADER_ENTRY, bytes: header.bytes }];
  for (const name of payloadNames(header.format)) {
    const bytes = await files.readBytes(setFilePath(id, name));
    if (bytes) entries.push({ name, bytes });
    else if (REQUIRED_PAYLOAD.includes(name)) throw new Error(`Language set "${id}" is missing ${name}.`);
  }
  return zipEntries(entries, { store: false });
};

export { exportRlang };
