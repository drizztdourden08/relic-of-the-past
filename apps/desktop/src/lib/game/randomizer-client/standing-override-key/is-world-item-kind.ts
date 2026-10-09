/* @layer bridge-wasm @kind logic */
import type { CheckRecord } from '@rotp/game-data';

const isWorldItemKind = (check: CheckRecord): boolean =>
  check.kind === 'standing' || check.kind === 'dig' || check.kind === 'bonk';

export { isWorldItemKind };
