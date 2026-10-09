/* @layer bridge-wasm @kind logic */
import { log } from '../log-bus';
import type { EmscriptenModule } from './types';
import type { BootFiles } from './boot-files.type';
import { DEFAULT_ZELDA3_INI } from './config.constants';

const debugForcedAspect = (): string | null | undefined =>
  (window as unknown as { __relicDebug?: { forceAspect?: string | null } }).__relicDebug?.forceAspect;

const iniToWrite = (configIni: string | undefined): string => {
  const forceAspect = debugForcedAspect();
  return forceAspect && configIni
    ? configIni.replace(/^(ExtendedAspectRatio = [^\n]*?)\d+:\d+/m, `$1${forceAspect}`)
    : (configIni ?? DEFAULT_ZELDA3_INI);
};

const makeDirIfMissing = (mod: EmscriptenModule, path: string): void => {
  try { mod.FS.mkdir(path); } catch { return; }
};

const writeBootFiles = (mod: EmscriptenModule, f: BootFiles): void => {
  log.wasm(`Writing assets to virtual FS (${(f.assetData.byteLength / 1024).toFixed(0)} KB)`);
  mod.FS.writeFile('/zelda3_assets.dat', f.assetData);
  mod.FS.writeFile('/zelda3.ini', iniToWrite(f.configIni));
  makeDirIfMissing(mod, '/saves');
  if (f.sramData) mod.FS.writeFile('/saves/sram.dat', f.sramData);
  if (f.linkSprite) mod.FS.writeFile('/link_sprite.zspr', f.linkSprite);
};

export { writeBootFiles };
export type { BootFiles } from './boot-files.type';
