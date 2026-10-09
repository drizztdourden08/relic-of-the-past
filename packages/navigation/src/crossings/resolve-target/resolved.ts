/* @layer bridge-wasm @kind logic */
import type { GameScreenId } from '@rotp/game-data';
import type { CrossingTarget } from '@rotp/game-core';
import type { ResolvedTarget } from './resolve-target.type';

const resolved = (native: GameScreenId, label: string, screenId: CrossingTarget['screenId']): ResolvedTarget =>
  ({ target: { screenId, native }, label });

export { resolved };
