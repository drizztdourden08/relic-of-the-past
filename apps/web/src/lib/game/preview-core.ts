/* @layer bridge-wasm @kind logic */
/**
 * A core loaded for the sole purpose of rendering original sounds, when no game is running.
 *
 * The preview chip itself is already independent of the running game (emscripten_sound_preview.c
 * gives it its own SpcPlayer), but it reads the sound banks out of the parsed assets, and those are
 * only parsed once a core has booted. Auditioning a sound in the pack studio should not require
 * starting the game first, so when there is no game module this boots one that never runs the game:
 * `noInitialRun` skips `main`, so no SDL, no canvas, no frame loop — just the assets in memory and
 * the preview export reading them.
 *
 * It is a second WebAssembly instance of the same compiled module, which costs its own heap. That is
 * why it is created on demand and abandoned the moment a real game module exists: from then on the
 * game's own core answers previews, and holding two would be waste.
 */
import { log } from '../log-bus';
import * as assetsStore from '../storage/assets-store';
import * as profileStore from '../storage/profile-store';
import { writeBootFiles } from './boot-files';
import { createInstantiateWasm } from './instantiate-wasm';
import { loadGlueScript } from './wasm-warmup';
import { getModule } from './wasm-bridge';
import type { EmscriptenModule } from './types';

declare const Zelda3: (config: Record<string, unknown>) => Promise<EmscriptenModule>;

let standalone: EmscriptenModule | null = null;
/** The ROM whose assets the standalone core holds, so switching profile rebuilds it. */
let standaloneRom: string | null = null;
let booting: Promise<EmscriptenModule | null> | null = null;

/**
 * The ROM to read sound banks from: the one the active profile would boot. Falls back to the first
 * profile that has one, so a fresh install with a single profile works before anything is played.
 */
const activeRomFile = async (): Promise<string | null> => {
  try {
    const [state, profiles] = await Promise.all([
      profileStore.getAppState(),
      profileStore.listProfiles(),
    ]);
    const active = profiles.find((p) => p.id === state.lastProfileId);
    return active?.romFile ?? profiles.find((p) => p.romFile)?.romFile ?? null;
  } catch {
    return null;
  }
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
    const module = await Zelda3({
      // No main(): this core exists to hold parsed assets, not to run anything.
      noInitialRun: true,
      instantiateWasm: createInstantiateWasm(),
      preRun: [(mod: EmscriptenModule) => {
        writeBootFiles(mod, { assetData: new Uint8Array(buffer), linkSprite: null });
      }],
      // Core chatter from a preview boot is noise in the game log; keep only failures.
      print: () => {},
      printErr: (text: string) => log.core(text, 'error'),
    });
    // Parses zelda3_assets.dat and sets the core up without SDL, which is what makes the sound
    // banks readable. Whatever else it initialises simply goes unused here.
    module.ccall('WasmInitHeadless', null, [], []);
    standaloneRom = romFile;
    log.app('Sound preview: core loaded for auditioning original sounds');
    return module;
  } catch (err) {
    log.error(`Sound preview: could not load a core (${err instanceof Error ? err.message : err})`);
    return null;
  }
};

/**
 * The module previews render through: the running game's when there is one, otherwise a standalone
 * core booted for the purpose. Null only when there is no ROM with extracted assets to read.
 */
const ensurePreviewModule = async (): Promise<EmscriptenModule | null> => {
  const game = getModule();
  if (game !== null) {
    // A real core supersedes ours; drop the reference so its heap can go.
    standalone = null;
    standaloneRom = null;
    return game;
  }
  if (standalone !== null) return standalone;

  // Boot once even when several rows ask at the same moment.
  booting ??= bootStandalone().then((mod) => {
    standalone = mod;
    booting = null;
    return mod;
  });
  return booting;
};

/** The already-resolved module, without triggering a boot. */
const previewModuleNow = (): EmscriptenModule | null => getModule() ?? standalone;

export { ensurePreviewModule, previewModuleNow };
