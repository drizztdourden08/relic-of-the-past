/* @layer bridge-wasm @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';

interface StateSnapshot {
  follower: number;
  progress: ArrayLike<number>;
}

interface ActiveState {
  id: string;
  label: Text;
  detail?: Text;
  hint?: Text;
  gating?: boolean;
}

type StateRule = (snap: StateSnapshot) => ActiveState | null;

export type { ActiveState, StateSnapshot, StateRule };
