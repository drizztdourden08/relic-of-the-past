/* @layer bridge-wasm @kind logic */
import { createGameCore } from '@drizztdourden08/brock-port-kit/renderer';
import { rotpPort } from '../port';
import { precompiledCore } from '../wasm-warmup';

const previewCore = createGameCore(rotpPort, { precompiled: precompiledCore });

export { previewCore };
