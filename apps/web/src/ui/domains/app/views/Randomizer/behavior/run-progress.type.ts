/* @layer renderer-components @kind types */
interface CheckCounts {
  taken: number;
  available: number | null;
  left: number | null;
  total: number;
}

export type { CheckCounts };
