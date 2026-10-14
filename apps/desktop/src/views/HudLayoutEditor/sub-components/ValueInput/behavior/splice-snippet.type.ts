/* @layer renderer-components @kind types */
interface SpliceInput {
  text: string;
  caret: number;
  prefix: string;
  snippet: string;
  select?: string;
}

interface Spliced {
  next: string;
  from: number;
  to: number;
}

export type { SpliceInput, Spliced };
