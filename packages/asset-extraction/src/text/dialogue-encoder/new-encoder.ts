/* @layer shared-asset-extraction @kind logic */
import { kCmdInfo } from './cmd-info';

const newEncoder = (cmd: string, param: number | null): number[] => {
  const info = kCmdInfo[cmd];
  if (!info) throw new Error(`Invalid cmd: ${cmd}`);
  const [code, params] = info;
  if (params === undefined || typeof params === 'number') {
    if (param !== null) throw new Error(`Invalid cmd params: ${cmd} ${param}`);
    return params === undefined ? [code] : [code, params];
  }
  if (param === null || !(param in params)) {
    throw new Error(`Invalid cmd params: ${cmd} ${param}`);
  }
  const r = params[param];
  if (r === undefined) throw new Error(`Invalid cmd params: ${cmd} ${param}`);
  return r !== null ? [code, r] : [];
};

export { newEncoder };
