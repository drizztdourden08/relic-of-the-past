/* @layer bridge-wasm @kind logic */
import { createRomStore } from '@drizztdourden08/brock-port-kit';
import type { FileStore } from '@drizztdourden08/brock-core';
import { rotpPort } from './rotp-port';

const listRomInfos = async (files: FileStore): Promise<RomInfo[]> =>
  (await createRomStore(files, rotpPort).listNames()).map(({ file, hasAssets, assetBytes }) => ({
    romFile: file,
    hasAssets,
    assetSize: hasAssets ? assetBytes : null,
  }));

export { listRomInfos };
