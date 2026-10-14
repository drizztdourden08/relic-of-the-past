/* @layer bridge-wasm @kind logic */
import { DEFAULT_ZELDA3_INI } from '@rotp/game-core';

const debugForcedAspect = (): string | null => {
  const debug: unknown = Reflect.get(window, '__relicDebug');
  if (typeof debug !== 'object' || debug === null) return null;
  const aspect: unknown = Reflect.get(debug, 'forceAspect');
  return typeof aspect === 'string' ? aspect : null;
};

const coreConfigIni = (configIni: string | undefined): string => {
  const forceAspect = debugForcedAspect();
  return forceAspect && configIni
    ? configIni.replace(/^(ExtendedAspectRatio = [^\n]*?)\d+:\d+/m, `$1${forceAspect}`)
    : (configIni ?? DEFAULT_ZELDA3_INI);
};

export { coreConfigIni };
