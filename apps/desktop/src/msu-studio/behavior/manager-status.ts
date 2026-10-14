/* @layer renderer-components @kind logic */
import type { ManagerStatusInput } from './manager-status.type';

const managerStatus = (input: ManagerStatusInput): { statusMessage: string | null; statusOk: boolean } => {
  const { previewError, exportProgress, status } = input;
  return {
    statusMessage: previewError ?? exportProgress ?? status?.message ?? null,
    statusOk: previewError ? false : status?.success !== false,
  };
};

export { managerStatus };
