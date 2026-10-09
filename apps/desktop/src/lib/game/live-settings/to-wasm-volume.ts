/* @layer bridge-wasm @kind logic */
import { PERCENT_TO_WASM_VOLUME } from './live-settings.constants';

const toWasmVolume = (percent: number, muted = false): number =>
  muted ? 0 : Math.round(percent * PERCENT_TO_WASM_VOLUME);

export { toWasmVolume };
