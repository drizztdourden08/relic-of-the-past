/* @layer renderer-lib @kind types */
import type { ExtractInputs, ExtractStepId } from '@app/game/extract-steps';

interface ExtractJob<Id extends ExtractStepId> {
  step: Id;
  title: string;
  subject: string;
  romBytes: Uint8Array;
  input: ExtractInputs[Id];
}

export type { ExtractJob };
