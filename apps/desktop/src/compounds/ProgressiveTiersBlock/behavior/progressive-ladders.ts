/* @layer renderer-components @kind logic */
import { getItemSprite } from '@rotp/game-data';
import { PROGRESSIVE_FAMILIES, progressiveFamilyName, progressiveTierName, progressiveTierKeyOf } from '@rotp/randomizer';
import type { ProgressiveFamilyId, ProgressiveModeSetting, ProgressiveSetting } from '@rotp/randomizer';
import type { ItemId } from '@rotp/game-data';
import type { LadderStepperModel } from '@app/composites/LadderStepper';

interface ProgressiveLadder extends LadderStepperModel {
  id: ProgressiveFamilyId;
}

const countTextOf = (ticked: number, total: number): string =>
  (ticked === 0 ? 'none in the pool' : `${ticked} of ${total} in the pool`);

const spriteOf = (item: ItemId | undefined, spritesAvailable: boolean): string | undefined =>
  (spritesAvailable && item !== undefined ? getItemSprite(item) : undefined);

const progressiveLaddersOf = (
  setting: ProgressiveSetting, modes: Partial<ProgressiveModeSetting>, spritesAvailable: boolean,
): ProgressiveLadder[] =>
  PROGRESSIVE_FAMILIES.map((family) => {
    const rungs = family.tierLabels.map((_neutral, index) => {
      const sprite = spriteOf(family.tiers[index], spritesAvailable);
      return {
        key: progressiveTierKeyOf(family.id, index),
        label: progressiveTierName(family, index),
        index,
        checked: setting[family.id][index] !== false,
        ...(sprite === undefined ? {} : { sprite }),
      };
    });
    const ticked = rungs.filter((rung) => rung.checked).length;
    return {
      id: family.id,
      name: progressiveFamilyName(family),
      countText: countTextOf(ticked, rungs.length),
      rungs,
      noneOn: ticked === 0,
      mode: modes[family.id] ?? 'progressive',
    };
  });

export type { ProgressiveLadder };
export { progressiveLaddersOf };
