/* @layer bridge-wasm @kind logic */
import { getGameState, getModule } from '../wasm-bridge';

const isCoreReady = (): boolean => getModule() !== null && getGameState().status === 'running';

export { isCoreReady };
