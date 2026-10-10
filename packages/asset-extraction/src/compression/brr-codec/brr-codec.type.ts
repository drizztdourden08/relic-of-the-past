/* @layer shared-asset-extraction @kind types */
type BrrHistory = readonly [old: number, older: number];

interface BrrBlockTry {
  data: Int16Array | number[];
  p: number;
  filter: number;
  range: number;
  start: BrrHistory;
  lossless: boolean;
}

interface BrrBlockResult {
  error: number;
  history: BrrHistory;
  nibbles: number[];
}

interface BrrBlockChoice extends BrrBlockResult {
  filter: number;
  range: number;
}

interface BrrNibble {
  error: number;
  nibble: number;
  sample: number;
}

export type { BrrBlockChoice, BrrBlockResult, BrrBlockTry, BrrHistory, BrrNibble };
