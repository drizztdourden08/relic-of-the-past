/* @layer electron-main @kind types */
interface Span {
  start: number;
  end: number;
}

interface WriteResult {
  content: string;
  error?: string;
}

export type { Span, WriteResult };
