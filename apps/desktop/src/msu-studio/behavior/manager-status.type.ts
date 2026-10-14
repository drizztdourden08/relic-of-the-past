/* @layer renderer-components @kind types */
import type { ActionResult } from '../msu.type';

type ManagerStatusInput = {
  previewError: string | null;
  exportProgress: string | null;
  status: ActionResult | null;
};

export type { ManagerStatusInput };
