/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { createPack, listPacks, writeManifest, writeTrackFile } from '../../packs';
import { readMsulPack } from '../import-msul';
import { FALLBACK_PACK_NAME } from './install-msul-pack.constants';
import type { InstallOptions, InstallResult } from './install-msul-pack.type';
import { sanitizePackName } from './sanitize-pack-name';
import { uniquePackName } from './unique-pack-name';

const installMsulPack = async (
  store: FileStore, bytes: Uint8Array, options: InstallOptions = {},
): Promise<InstallResult> => {
  const { desiredName, onProgress } = options;
  const { manifest, files } = await readMsulPack(bytes);
  const existing = (await listPacks(store)).map((p) => p.name);
  const ownName = sanitizePackName(desiredName || manifest.meta.name) || FALLBACK_PACK_NAME;
  const pack = uniquePackName(ownName, existing);
  await createPack(store, pack, manifest.meta);

  const written = new Set<string>();
  let done = 0;
  for (const entry of files) {
    const name = entry.name.split('/').pop() ?? '';
    if (name && !written.has(name)) {
      await writeTrackFile(store, pack, name, entry.bytes);
      written.add(name);
    }
    done += 1;
    onProgress?.(done, files.length);
  }
  await writeManifest(store, pack, manifest);

  const missingFiles = (manifest.files ?? []).filter((name) => !written.has(name));
  return { pack, ownName, fileCount: written.size, trackCount: manifest.tracks.length, missingFiles };
};

export { installMsulPack };
