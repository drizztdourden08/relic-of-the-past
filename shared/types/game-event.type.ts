/* @layer shared-types @kind types */
interface GameEvent {
  type: string;
  timestamp: number;
  payload: unknown;
}

export type { GameEvent };
