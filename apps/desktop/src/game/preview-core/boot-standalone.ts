/* @layer bridge-wasm @kind logic */
import type { CoreLog } from '@drizztdourden08/brock-port-kit/renderer';
import type { EmscriptenModule } from '@rotp/game-core';
import { previewCoreState } from '@rotp/game-core';
import { log } from '../../log-bus';
import * as assetsStore from '../../storage/assets-store';
import { activeRomFile } from '../active-rom-file';
import { coreConfigIni } from '../core-config-ini';
import { isGameModule } from '../lifecycle/is-game-module';
import { loadGlueScript } from '../wasm-warmup';
import { previewCore } from './preview-core';

const errorsOnly: CoreLog = (text, level) => {
  if (level === 'error') log.core(text, 'error');
};

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
    await previewCore.initHeadless({ assets: new Uint8Array(buffer), config: coreConfigIni(undefined), log: errorsOnly });
    const module = previewCore.module();
    const { status, error } = previewCore.state();
    if (status !== 'running' || !isGameModule(module)) throw new Error(error ?? 'The core did not start.');
    previewCoreState.standaloneRom = romFile;
    log.app('Sound preview: core loaded for auditioning original sounds');
    return module;
  } catch (err) {
    log.error(`Sound preview: could not load a core (${err instanceof Error ? err.message : err})`);
    return null;
  }
};

export { bootStandalone };
