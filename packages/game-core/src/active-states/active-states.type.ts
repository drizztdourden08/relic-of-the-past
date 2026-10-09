/* @layer bridge-wasm @kind types */
interface StateSnapshot {
  follower: number;
  progress: ArrayLike<number>;
}

interface ActiveState {
  id: string;
  label: string;
  detail?: string;
  hint?: string;
  gating?: boolean;
}

type StateRule = (snap: StateSnapshot) => ActiveState | null;

export type { ActiveState, StateSnapshot, StateRule };
