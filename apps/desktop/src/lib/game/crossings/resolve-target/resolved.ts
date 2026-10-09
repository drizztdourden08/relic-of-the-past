/* @layer bridge-wasm @kind logic */
import type { GameScreenId } from '@rotp/game-data';
import type { CrossingTarget } from '@shared/game/navigation';
import type { ResolvedTarget } from './resolve-target.type';

const resolved = (native: GameScreenId, label: string, screenId: CrossingTarget['screenId']): ResolvedTarget =>
  ({ target: { screenId, native }, label });

export { resolved };
