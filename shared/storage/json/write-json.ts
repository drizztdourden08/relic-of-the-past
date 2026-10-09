/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';

const writeJson = (files: FileStore, path: string, data: unknown): Promise<void> =>
  files.writeText(path, JSON.stringify(data, null, 2));

export { writeJson };
