/* @layer bridge-wasm @kind logic */
import { describeScreen } from '@rotp/game-data';
import type { GameScreenId } from '@rotp/game-data';
import { resolved } from './resolved';
import type { ResolvedTarget } from './resolve-target.type';

const overworldTarget = (screen: number): ResolvedTarget => {
  const native: GameScreenId = { kind: 'overworld', screen };
  const described = describeScreen({ kind: 'game', gameId: native });
  return resolved(native, described.name ?? described.hexLabel, described.id);
};

export { overworldTarget };
