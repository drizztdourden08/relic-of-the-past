/* @layer bridge-wasm @kind logic */
import type { Settings } from './msu-pack-loader.type';

const groupVolume = (s: Settings, read: (s: Settings) => number): number =>
  (s.perGroupVolume ? read(s) : 100);

export { groupVolume };
