/* @layer renderer-lib @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { ExtractInputs, ExtractStepId } from '@app/game/extract-steps';

interface ExtractJob<Id extends ExtractStepId> {
  step: Id;
  title: Text;
  subject: string;
  romBytes: Uint8Array;
  input: ExtractInputs[Id];
}

export type { ExtractJob };
