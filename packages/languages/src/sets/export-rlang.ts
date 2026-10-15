/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { zipEntries } from '@rotp/roms';
import type { ZipEntry } from '@rotp/roms';
import { setFilePath, setMetaPath } from './paths';
import { REQUIRED_PAYLOAD, RLANG_HEADER_ENTRY, isSetHeader, payloadNames } from './rlang-format';

const readHeader = async (files: FileStore, id: string): Promise<Uint8Array> => {
  const bytes = await files.readBytes(setMetaPath(id));
  if (!bytes) throw new Error(`Language set "${id}" was not found.`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error(`Language set "${id}" has a damaged set.json.`);
  }
  if (!isSetHeader(parsed)) throw new Error(`Language set "${id}" has a set.json this version cannot export.`);
  return bytes;
};

const exportRlang = async (files: FileStore, id: string): Promise<Uint8Array> => {
  const header = await readHeader(files, id);

  const entries: ZipEntry[] = [{ name: RLANG_HEADER_ENTRY, bytes: header }];
  for (const name of payloadNames()) {
    const bytes = await files.readBytes(setFilePath(id, name));
    if (bytes) entries.push({ name, bytes });
    else if (REQUIRED_PAYLOAD.includes(name)) throw new Error(`Language set "${id}" is missing ${name}.`);
  }
  return zipEntries(entries, { store: false });
};

export { exportRlang };
