/* @layer shared-types @kind data */
import type { SendContract } from '../send-contract.type';

const SEND_MAP = {
  minimize: 'window:minimize',
  maximize: 'window:maximize',
  close: 'window:close',
  openDevTools: 'window:openDevTools',
  toggleFullscreen: 'window:toggleFullscreen',
  setFullscreen: 'window:setFullscreen',
  setAspectRatioLock: 'window:setAspectRatioLock',
  shellReady: 'window:shellReady',
  appendSessionLog: 'debug:appendSessionLog',
} as const satisfies Record<string, keyof SendContract>;

export { SEND_MAP };
