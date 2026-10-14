/* @layer renderer-lib @kind logic */
import { freeSequenceProblem } from '@rotp/randomizer';
import type { FamilySetting } from '@rotp/randomizer';
import type { CapacityRowModel } from '@app/compounds/CapacityFamilyRow';

const problemOf = (setting: FamilySetting, span: number, maxJump: number): CapacityRowModel['problem'] =>
  setting.mode === 'custom' && setting.shape.curve === 'free'
    ? freeSequenceProblem(setting.shape.jumps, span, maxJump)
    : undefined;

export { problemOf };
