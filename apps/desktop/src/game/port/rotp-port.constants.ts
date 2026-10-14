/* @layer bridge-wasm @kind constants */
import type { CoreDefinition } from '@drizztdourden08/brock-port-kit';
import { AUTO_SAVE_SLOT } from '@rotp/game-core';

const ROTP_PORT_ID = 'relic-of-the-past';

const ROTP_CORE: CoreDefinition = {
  glue: './wasm/zelda3.js',
  wasm: 'wasm/zelda3.wasm',
  factory: 'Zelda3',
  files: {
    assets: '/zelda3_assets.dat',
    config: '/zelda3.ini',
    sram: '/saves/sram.dat',
    state: '/saves/save{slot}.sav',
    scratchSlot: AUTO_SAVE_SLOT,
  },
  exports: {
    stop: 'WasmStop',
    initHeadless: 'WasmInitHeadless',
    saveSram: 'WasmSaveSram',
    saveState: 'WasmSaveState',
    loadState: 'WasmLoadState',
  },
};

const LINK_SPRITE_FILE = '/link_sprite.zspr';

const SRAM_SYNC_MS = 5000;

const CRASH_ARM_DELAY_MS = 200;

export { CRASH_ARM_DELAY_MS, LINK_SPRITE_FILE, ROTP_CORE, ROTP_PORT_ID, SRAM_SYNC_MS };
