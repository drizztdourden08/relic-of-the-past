/* @layer bridge-wasm @kind types */
type CheckDetection =
  | { mode: 'room-mask'; roomId: number; mask: number }
  | { mode: 'ow-mask'; owScreen: number; mask: number }
  | { mode: 'progress'; bufferIndex: number; mask?: number; compare?: 'gte' | 'eq' | 'any-of'; value?: number | number[] };

export type { CheckDetection };
