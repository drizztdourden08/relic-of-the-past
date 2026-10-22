/* @layer renderer-components @kind logic */
import type { LadderStep } from '@app/composites/LadderStepper';
import type { ProgressiveLadder } from './progressive-ladders.type';

const stepsOfLadder = (
  ladder: ProgressiveLadder, onRungChange: ((index: number, checked: boolean) => void) | undefined,
): LadderStep[] =>
  ladder.rungs.map((rung) => ({
    key: rung.key,
    label: rung.label,
    sprite: rung.sprite,
    active: rung.checked,
    struck: !rung.checked,
    onToggle: onRungChange === undefined ? undefined : () => onRungChange(rung.index, !rung.checked),
  }));

export { stepsOfLadder };
