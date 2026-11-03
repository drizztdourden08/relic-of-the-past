/* @layer bridge-wasm @kind logic */
import type { Failure } from '@drizztdourden08/archipelia-lobby-protocol';

const gameProblem = (allowedGames: readonly string[] | undefined, game: string): Failure | null => {
  if (allowedGames === undefined || allowedGames.length === 0) return null;
  const wanted = game.toLowerCase();
  if (allowedGames.some((allowed) => allowed.toLowerCase() === wanted)) return null;
  return { code: 'game-not-allowed', message: `This lobby does not accept ${game}.`, field: 'slots[0].game' };
};

export { gameProblem };
