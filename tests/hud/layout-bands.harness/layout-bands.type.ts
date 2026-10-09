/* @layer tests @kind type */
interface Box { h: number; top: number; bottom: number; left: number; right: number }

interface Measured {
  case: string;
  height: number;
  parts: Record<string, Box>;
  steps: Box[];
  pieces: Box[];
  labels: string[];
  tiles: Box[];
  titles: string[];
  adds: Record<string, Box>;
  lastHeads: Record<string, Box>;
  painted: string[];
  overflow: number;
}

interface Rig {
  at: (rail: number, kase: string) => Measured;
  close: () => Promise<void>;
}

export type { Box, Measured, Rig };
