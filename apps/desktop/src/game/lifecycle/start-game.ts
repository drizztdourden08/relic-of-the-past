/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { reassertHostGates, getGameState, setModule, setProfileId, setState, exposeDebugHandles } from '@rotp/game-core';
import { bootGameModule } from './boot-game-module';
import { readProfileSram } from './read-profile-sram';
import { rotpCore } from './rotp-core';
import { startSessionServices } from './start-session-services';

const startGame = async (canvas: HTMLCanvasElement, assetData: Uint8Array, configIni?: string, profileId?: string): Promise<void> => {
  const currentState = getGameState();
  if (currentState.status === 'loading' || currentState.status === 'running') {
    log.wasm('Game already running, so the start request is ignored');
    return;
  }
  rotpCore.stop();
  setState({ status: 'loading', error: null });
  log.wasm('Initializing WASM module...');
  try {
    const sramData = await readProfileSram(profileId);
    const module = await bootGameModule(canvas, assetData, configIni, sramData);
    if (!module) return;
    setModule(module);
    setProfileId(profileId ?? null);
    exposeDebugHandles(module);
    setState({ status: 'running', error: null });
    reassertHostGates();
    log.wasm('WASM module running');
    canvas.focus();
    startSessionServices(profileId ?? null);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`WASM failed: ${msg}`);
    setState({ status: 'error', error: msg });
  }
};

export { startGame };
