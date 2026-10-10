/* @layer tests @kind type */
interface ParityDigest {
  digest: string;
  trues: number;
}

interface ExportParity {
  asked: number;
  mismatches: string[];
  leftHelpers: string[];
}

export type { ExportParity, ParityDigest };
