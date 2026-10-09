/* @layer renderer-lib @kind logic */
import { NO_WALLET_FLOOR, capacityFieldsOf, defaultFamilyBonus, freeSequenceProblem, minCountFor, planOf } from '@rotp/randomizer';
import type { CapacityRowModel } from '@domains/app/compounds/CapacityFamilyRow';
import { rowStateOf } from '../capacity-row-state';
import { familyImpactCell } from '../family-impact-cell';
import type { CapacityRowInput } from './capacity-row-model.type';
import { FAMILY_LABEL } from './capacity-row-model.constants';
import { captionOf } from './caption-of';
import { curveOptionsOf } from './curve-options-of';
import { floorNoteOf } from './floor-note-of';
import { previewOf } from './preview-of';
import { stopsOf } from './stops-of';

const capacityRowModelOf = (input: CapacityRowInput): CapacityRowModel => {
  const { family: capacityFamily, setting, fillerHeadroom, progressive = false, forced, walletFloor = NO_WALLET_FLOOR } = input;
  const { id, maxJump } = capacityFamily;
  const plan = planOf(capacityFamily, setting, progressive);
  const state = rowStateOf(capacityFamily, setting);
  const span = state.range[1] - state.range[0];
  const minCount = Math.max(1, minCountFor(span, maxJump));
  const inPool = plan.items.length;
  const headroom = id === 'wallet' && fillerHeadroom !== null ? inPool + fillerHeadroom : span;
  const isWallet = id === 'wallet';
  return {
    id,
    label: FAMILY_LABEL[id],
    caption: captionOf.mode(id),
    stops: stopsOf(capacityFamily),
    offersInPool: !isWallet,
    hasCurve: capacityFieldsOf(id).includes('curve'),
    rangeStep: isWallet ? 10 : 1,
    labelEvery: isWallet ? 10 : 1,
    state,
    span,
    minCount,
    maxCount: Math.max(minCount, Math.min(span, headroom)),
    maxJump,
    curveOptions: curveOptionsOf(capacityFamily),
    preview: previewOf(capacityFamily, setting, plan),
    impact: familyImpactCell(plan.spotIsCheck, inPool),
    problem: setting.mode === 'custom' && setting.shape.curve === 'free'
      ? freeSequenceProblem(setting.shape.jumps, span, maxJump)
      : undefined,
    footnote: isWallet && setting.mode === 'custom' ? 'turns "Carry more rupees" on for this profile' : undefined,
    floorNote: floorNoteOf(capacityFamily, setting, walletFloor),
    bonus: setting.mode === 'vanilla' ? undefined : input.bonus ?? defaultFamilyBonus(id),
    bonusCaption: captionOf.bonus(id),
    forced,
  };
};

export { capacityRowModelOf };
export type { CapacityRowInput };
