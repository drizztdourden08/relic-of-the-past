/* @layer bridge-wasm @kind logic */
/**
 * Writes every boot input into the Emscripten MEMFS during preRun: game assets, the INI, SRAM
 * and the custom player sprite. Extracted from lifecycle.ts so each stays small and single-purpose.
 */
import { log } from '../log-bus';
import type { EmscriptenModule } from './types';
import { DEFAULT_ZELDA3_INI } from './config';

interface BootFiles {
  assetData: Uint8Array;
  configIni?: string;
  sramData?: Uint8Array | null;
  linkSprite: Uint8Array | null;
}

const writeBootFiles = (mod: EmscriptenModule, f: BootFiles): void => {
  log.wasm(`Writing assets to virtual FS (${(f.assetData.byteLength / 1024).toFixed(0)} KB)`);
  mod.FS.writeFile('/zelda3_assets.dat', f.assetData);
  // Dev/test aid: __relicDebug.forceAspect swaps the W:H token on the ExtendedAspectRatio line. No-op normally.
  const forceAspect = (window as unknown as { __relicDebug?: { forceAspect?: string | null } }).__relicDebug?.forceAspect;
  const ini = forceAspect && f.configIni
    ? f.configIni.replace(/^(ExtendedAspectRatio = [^\n]*?)\d+:\d+/m, `$1${forceAspect}`)
    : (f.configIni ?? DEFAULT_ZELDA3_INI);
  mod.FS.writeFile('/zelda3.ini', ini);
  try { mod.FS.mkdir('/saves'); } catch { /* may exist */ }
  if (f.sramData) mod.FS.writeFile('/saves/sram.dat', f.sramData);
  // Custom player sprite: the INI's LinkGraphics key points here (serializeToIni → ApplyCustomLinkGraphics).
  if (f.linkSprite) mod.FS.writeFile('/link_sprite.zspr', f.linkSprite);
};

export { writeBootFiles };
export type { BootFiles };
