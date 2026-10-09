/* @layer shared-game @kind logic */
import { familyOfId } from '../family-of-id';
import { progressiveFamilyName, progressiveTierName } from '../progressive-display-names';
import { tickedIndexesOf } from '../progressive-reach';
import { REQUIRED_RUNGS } from './tick-set-check.constants';
import type { ProgressiveSetting } from '../progressive.type';

const unrollableTickSetReasons = (setting: ProgressiveSetting): readonly string[] =>
  REQUIRED_RUNGS.flatMap(({ family, from, why }) => {
    if (tickedIndexesOf(setting, family).some((index) => index >= from)) return [];
    const def = familyOfId(family);
    return [`${progressiveFamilyName(def)} "${progressiveTierName(def, from)}" is unticked: ${why}.`];
  });

export { unrollableTickSetReasons };
