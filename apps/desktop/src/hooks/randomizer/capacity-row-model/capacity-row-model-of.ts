/* @layer renderer-lib @kind logic */
import { NO_WALLET_FLOOR, capacityFieldsOf, minCountFor, planOf } from '@rotp/randomizer';
import type { CapacityRowModel } from '@app/compounds/CapacityFamilyRow';
import { rowStateOf } from '../capacity-row-state';
import { familyImpactCell } from '../family-impact-cell';
import type { CapacityRowInput } from './capacity-row-model.type';
import { FAMILY_LABEL, STEP_SCALE, WALLET_SCALE } from './capacity-row-model.constants';
import { bonusOf } from './bonus-of';
import { captionOf } from './caption-of';
import { curveOptionsOf } from './curve-options-of';
import { floorNoteOf } from './floor-note-of';
import { footnoteOf } from './footnote-of';
import { headroomOf } from './headroom-of';
import { previewOf } from './preview-of';
import { problemOf } from './problem-of';
import { stopsOf } from './stops-of';

const capacityRowModelOf = (input: CapacityRowInput): CapacityRowModel => {
  const { family: capacityFamily, setting, fillerHeadroom, progressive = false, forced, walletFloor = NO_WALLET_FLOOR } = input;
  const { id, maxJump } = capacityFamily;
  const plan = planOf(capacityFamily, setting, progressive);
  const state = rowStateOf(capacityFamily, setting);
  const span = state.range[1] - state.range[0];
  const minCount = Math.max(1, minCountFor(span, maxJump));
  const inPool = plan.items.length;
  const headroom = headroomOf(id, fillerHeadroom, inPool, span);
  const isWallet = id === 'wallet';
  return {
    id,
    label: FAMILY_LABEL[id],
    caption: captionOf.mode(id),
    stops: stopsOf(capacityFamily),
    offersInPool: !isWallet,
    hasCurve: capacityFieldsOf(id).includes('curve'),
    ...(isWallet ? WALLET_SCALE : STEP_SCALE),
    state,
    span,
    minCount,
    maxCount: Math.max(minCount, Math.min(span, headroom)),
    maxJump,
    curveOptions: curveOptionsOf(capacityFamily),
    preview: previewOf(capacityFamily, setting, plan),
    impact: familyImpactCell(plan.spotIsCheck, inPool),
    problem: problemOf(setting, span, maxJump),
    footnote: footnoteOf(id, setting),
    floorNote: floorNoteOf(capacityFamily, setting, walletFloor),
    bonus: bonusOf(id, setting, input.bonus),
    bonusCaption: captionOf.bonus(id),
    forced,
  };
};

export { capacityRowModelOf };
export type { CapacityRowInput };
