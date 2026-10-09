/* @layer shared-game @kind types */
type GameScreenId =
  | { kind: 'overworld'; screen: number }
  | { kind: 'room'; room: number; palace?: number };

export type { GameScreenId };
