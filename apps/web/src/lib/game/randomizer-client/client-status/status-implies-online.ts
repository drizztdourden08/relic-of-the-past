/* @layer bridge-wasm @kind logic */
import type { PlayerStatus } from './client-status.type';

const statusImpliesOnline = (status: PlayerStatus): boolean | null => {
  const goalOutlivesTheClient = status === 'goal';
  if (goalOutlivesTheClient) return null;
  return status !== 'unknown';
};

export { statusImpliesOnline };
