/* @layer renderer-components @kind types */
type GhostTone = 'move' | 'refused';

interface GhostModel {
  tone: GhostTone;
  chip: string;
  kind: string;
  position: string;
  path: string;
  warn: boolean;
}

export type { GhostModel };
