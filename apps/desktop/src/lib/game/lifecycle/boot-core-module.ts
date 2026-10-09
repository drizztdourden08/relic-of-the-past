/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { writeBootFiles } from '../boot-files';
import { restoreLostContext } from '../canvas-context';
import { createInstantiateWasm } from '../instantiate-wasm';
import type { EmscriptenModule } from '../types';
import { loadGlueScript } from '../wasm-warmup';
import { lifecycleState } from './lifecycle-state';

declare function Zelda3(config: Record<string, unknown>): Promise<EmscriptenModule>;

const bootCoreModule = async (
  canvas: HTMLCanvasElement,
  assetData: Uint8Array,
  configIni: string | undefined,
  sramData: Uint8Array | null,
): Promise<EmscriptenModule> => {
  await loadGlueScript();
  const instantiateWasm = createInstantiateWasm();
  await restoreLostContext(canvas);
  canvas.getContext('webgl', { preserveDrawingBuffer: true });
  return Zelda3({
    canvas,
    instantiateWasm,
    preRun: [(mod: EmscriptenModule) => {
      writeBootFiles(mod, { assetData, configIni, sramData, linkSprite: lifecycleState.pendingLinkSprite });
      lifecycleState.pendingLinkSprite = null;
    }],
    print: (text: string) => {
      log.core(text);
      if (text.startsWith('[TRACE]')) console.log(text);
    },
    printErr: (text: string) => log.core(text, 'error'),
  });
};

export { bootCoreModule };
