/* @layer bridge-wasm @kind logic */
import { lifecycleState, restoreLostContext } from '@rotp/game-core';
import type { EmscriptenModule } from '@rotp/game-core';
import { log } from '../../log-bus';
import { coreConfigIni } from '../core-config-ini';
import { LINK_SPRITE_FILE } from '../port';
import { loadGlueScript } from '../wasm-warmup';
import { gameCoreLog } from './game-core-log';
import { isGameModule } from './is-game-module';
import { rotpCore } from './rotp-core';

const bootGameModule = async (
  canvas: HTMLCanvasElement,
  assetData: Uint8Array,
  configIni: string | undefined,
  sramData: Uint8Array | null,
): Promise<EmscriptenModule | null> => {
  await loadGlueScript();
  await restoreLostContext(canvas);
  const linkSprite = lifecycleState.pendingLinkSprite;
  log.wasm(`Writing assets to virtual FS (${(assetData.byteLength / 1024).toFixed(0)} KB)`);
  await rotpCore.start({
    assets: assetData,
    canvas,
    config: coreConfigIni(configIni),
    sram: sramData,
    extraFiles: linkSprite ? { [LINK_SPRITE_FILE]: linkSprite } : {},
    log: gameCoreLog,
  });
  lifecycleState.pendingLinkSprite = null;
  const { status, error } = rotpCore.state();
  if (status === 'idle') return null;
  const mod = rotpCore.module();
  if (status !== 'running' || !isGameModule(mod)) throw new Error(error ?? 'The core did not start.');
  return mod;
};

export { bootGameModule };
