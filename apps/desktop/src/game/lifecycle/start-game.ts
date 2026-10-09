/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { reassertHostGates, getGameState, setModule, setProfileId, setState, detachCrashHandler, exposeDebugHandles, CRASH_GUARD_ARM_DELAY_MS, lifecycleState } from '@rotp/game-core';
import { bootCoreModule } from './boot-core-module';
import { createWasmCrashGuard } from './create-wasm-crash-guard';
import { readProfileSram } from './read-profile-sram';
import { startSessionServices } from './start-session-services';

const startGame = async (canvas: HTMLCanvasElement, assetData: Uint8Array, configIni?: string, profileId?: string): Promise<void> => {
  const currentState = getGameState();
  if (currentState.status === 'loading' || currentState.status === 'running') {
    log.wasm('Game already running, so the start request is ignored');
    return;
  }
  detachCrashHandler();
  lifecycleState.startGeneration++;
  setState({ status: 'loading', error: null });
  log.wasm('Initializing WASM module...');
  const crashGuard = createWasmCrashGuard();
  try {
    lifecycleState.activeCrashHandler = crashGuard.handler;
    window.addEventListener('error', crashGuard.handler);
    const sramData = await readProfileSram(profileId);
    const module = await bootCoreModule(canvas, assetData, configIni, sramData);
    setModule(module);
    reassertHostGates();
    setProfileId(profileId ?? null);
    exposeDebugHandles(module);
    setState({ status: 'running', error: null });
    log.wasm('WASM module running');
    canvas.focus();
    startSessionServices(profileId ?? null);
    const myGen = lifecycleState.startGeneration;
    await new Promise<void>((r) => setTimeout(r, CRASH_GUARD_ARM_DELAY_MS));
    if (myGen !== lifecycleState.startGeneration) return;
    crashGuard.arm();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`WASM failed: ${msg}`);
    setState({ status: 'error', error: msg });
    window.removeEventListener('error', crashGuard.handler);
  }
};

export { startGame };
