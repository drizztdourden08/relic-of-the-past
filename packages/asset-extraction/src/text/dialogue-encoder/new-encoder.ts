/* @layer shared-asset-extraction @kind logic */
import type { CommandParamMap } from './dialogue-encoder.type';
import { kCmdInfo } from './cmd-info';

const newEncoder = (cmd: string, param: number | null): number[] => {
  const info = kCmdInfo[cmd];
  if (!info) throw new Error(`Invalid cmd: ${cmd}`);
  if (info.length <= 1 || typeof info[1] === 'number') {
    if (param !== null) throw new Error(`Invalid cmd params: ${cmd} ${param}`);
    return [...info] as number[];
  } else {
    if (param === null || !info[1] || !(param in (info[1] as CommandParamMap))) {
      throw new Error(`Invalid cmd params: ${cmd} ${param}`);
    }
    const r = (info[1] as CommandParamMap)[param];
    if (r === undefined) throw new Error(`Invalid cmd params: ${cmd} ${param}`);
    return r !== null ? [info[0], r] : [];
  }
};

export { newEncoder };
