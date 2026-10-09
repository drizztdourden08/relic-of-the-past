/* @layer bridge-wasm @kind logic */
import { describeScreen } from '@shared/game/logic/queries/describe-screen';
import type { GameScreenId } from '@shared/game/logic/queries/game-id';
import { resolved } from './resolved';
import type { ResolvedTarget } from './resolve-target.type';

const overworldTarget = (screen: number): ResolvedTarget => {
  const native: GameScreenId = { kind: 'overworld', screen };
  const described = describeScreen({ kind: 'game', gameId: native });
  return resolved(native, described.name ?? described.hexLabel, described.id);
};

export { overworldTarget };
