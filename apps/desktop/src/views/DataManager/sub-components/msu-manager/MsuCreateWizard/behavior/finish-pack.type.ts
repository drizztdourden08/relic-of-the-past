/* @layer renderer-components @kind types */
import type { ActionResult } from '../../../../../../msu-studio/msu.type';

interface FinishContext {
  refresh: () => Promise<void>;
  importMsul: (file: File, name: string) => Promise<ActionResult>;
}

export type { FinishContext };
