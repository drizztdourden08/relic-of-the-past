/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../types';
import { log } from '../../log-bus';
import * as assetsStore from '../../storage/assets-store';
import { activeRomFile } from '../active-rom-file';
import { writeBootFiles } from '../boot-files';
import { createInstantiateWasm } from '../instantiate-wasm';
import { loadGlueScript } from '../wasm-warmup';
import { previewCoreState } from './preview-core-state';

declare const Zelda3: (config: Record<string, unknown>) => Promise<EmscriptenModule>;

const ignoreCoreChatter = (): void => undefined;

const bootStandalone = async (): Promise<EmscriptenModule | null> => {
  const romFile = await activeRomFile();
  if (romFile === null) return null;

  try {
    const buffer = await assetsStore.loadAssets(romFile);
    if (!buffer) {
      log.app('Sound preview: this ROM has no extracted assets yet');
      return null;
    }
    await loadGlueScript();
    const module = await Zelda3({
      noInitialRun: true,
      instantiateWasm: createInstantiateWasm(),
      preRun: [(mod: EmscriptenModule) => {
        writeBootFiles(mod, { assetData: new Uint8Array(buffer), linkSprite: null });
      }],
      print: ignoreCoreChatter,
      printErr: (text: string) => log.core(text, 'error'),
    });
    module.ccall('WasmInitHeadless', null, [], []);
    previewCoreState.standaloneRom = romFile;
    log.app('Sound preview: core loaded for auditioning original sounds');
    return module;
  } catch (err) {
    log.error(`Sound preview: could not load a core (${err instanceof Error ? err.message : err})`);
    return null;
  }
};

export { bootStandalone };
