/* @layer renderer-lib @kind constants */
import { autoRefOf } from './auto-ref-of';
import type { LobbyConnect } from './lobby-draft.type';
import type { RefStrategy } from './lobby-ref-of.type';
import { manualRefOf } from './manual-ref-of';

const REF_STRATEGIES: Readonly<Record<LobbyConnect, RefStrategy>> = {
  auto: autoRefOf,
  manual: manualRefOf,
};

export { REF_STRATEGIES };
