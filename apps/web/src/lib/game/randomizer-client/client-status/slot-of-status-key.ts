/* @layer bridge-wasm @kind logic */
import { KEY_PATTERN } from './client-status.constants';

const slotOfStatusKey = (key: string, team: number): number | null => {
  const match = KEY_PATTERN.exec(key);
  if (match === null || Number(match[1]) !== team) return null;
  return Number(match[2]);
};

export { slotOfStatusKey };
