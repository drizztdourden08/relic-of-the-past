/* @layer shared-game @kind types */
interface Frame {
  path: string;
  isArray: boolean;
  index: number;
}

interface PathScan {
  source: string;
  lines: Map<string, number>;
  stack: Frame[];
  line: number;
  quote: string | null;
  pendingPath: string | null;
  i: number;
}

export type { Frame, PathScan };
