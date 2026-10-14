/* @layer renderer-lib @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { manifestFileOf } from './manifest-file-of';
import { portManifestText } from './port-manifest-text';
import { rotpManifestText } from './rotp-manifest-text';

const manifestCodecFiles = (files: FileStore): FileStore => {
  const readText = async (path: string): Promise<string | null> => {
    const text = await files.readText(path);
    const file = manifestFileOf(path);
    return text === null || file === null ? text : portManifestText(files, file, text);
  };

  const writeText = (path: string, data: string): Promise<void> => {
    const file = manifestFileOf(path);
    return files.writeText(path, file === null ? data : rotpManifestText(file.kind, data));
  };

  return {
    readBytes: (path) => files.readBytes(path),
    readText,
    writeBytes: (path, data) => files.writeBytes(path, data),
    writeText,
    list: (dir) => files.list(dir),
    remove: (path) => files.remove(path),
    exists: (path) => files.exists(path),
    mkdir: (dir) => files.mkdir(dir),
    stat: (path) => files.stat(path),
  };
};

export { manifestCodecFiles };
