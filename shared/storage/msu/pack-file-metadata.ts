/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { AudioProbe } from '@shared/types/audio-probe';
import { isAudioFile, packDir } from '../msu-paths';
import { baseMetadata } from './base-metadata';
import { mapLimited } from './map-limited';
import { PROBE_CONCURRENCY, PROBEABLE_EXTENSIONS } from './msu.constants';
import type { MsuFileMetadata } from './msu.type';

const packFileMetadata = async (
  files: FileStore, pack: string, probe?: AudioProbe,
): Promise<MsuFileMetadata[]> => {
  const names = (await files.list(packDir(pack))).filter(isAudioFile);
  const rows = await mapLimited(names, PROBE_CONCURRENCY, async (name): Promise<MsuFileMetadata | null> => {
    const st = await files.stat(`${packDir(pack)}/${name}`);
    if (!st || st.isDirectory) return null;
    const row = baseMetadata(name, st.bytes);
    if (probe && PROBEABLE_EXTENSIONS.has(row.ext)) {
      const probed = await probe(`${packDir(pack)}/${name}`);
      if (probed) Object.assign(row, probed);
    }
    return row;
  });
  return rows.filter((row): row is MsuFileMetadata => row !== null);
};

export { packFileMetadata };
