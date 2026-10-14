/* @layer bridge-wasm @kind logic */
import { definePort } from '@drizztdourden08/brock-port-kit';
import { ROM_KINDS } from '@rotp/roms';
import { derivedAssetFiles } from './derived-asset-files';
import { romRulesOf } from './rom-rules-of';
import { ROTP_CORE, ROTP_PORT_ID, SRAM_SYNC_MS } from './rotp-port.constants';

const gba = ROM_KINDS['gba-alttp'];

const rotpPort = definePort({
  id: ROTP_PORT_ID,
  core: ROTP_CORE,
  rom: {
    ...romRulesOf(ROM_KINDS['snes-alttp'], derivedAssetFiles.ofBaseRom),
    kinds: { [gba.kind]: { label: gba.label, ...romRulesOf(gba, derivedAssetFiles.ofSupplementRom('gba-alttp')) } },
  },
  video: { mode: 'emscripten', context: 'webgl' },
  audio: { mode: 'emscripten-sdl' },
  saves: { quickSlots: 12, sramSyncMs: SRAM_SYNC_MS },
  assets: { extension: '.dat', extractors: [] },
});

export { rotpPort };
