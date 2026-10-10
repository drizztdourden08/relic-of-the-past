/* @layer tests @kind type */
interface ParityDigest {
  digest: string;
  trues: number;
}

interface ExportParity {
  asked: number;
  mismatches: string[];
  residualCalls: string[];
}

export type { ExportParity, ParityDigest };
