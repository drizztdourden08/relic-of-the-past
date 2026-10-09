/* @layer bridge-wasm @kind logic */
import { COMPLETION_BIT_BY_CHECK } from './randomizer-completion-bits.constants';
import type { CompletionBit } from './randomizer-completion-bits.type';

const completionBitOf = (checkId: string): CompletionBit | undefined =>
  COMPLETION_BIT_BY_CHECK.get(checkId);

export { completionBitOf };
export type { CompletionBit } from './randomizer-completion-bits.type';
