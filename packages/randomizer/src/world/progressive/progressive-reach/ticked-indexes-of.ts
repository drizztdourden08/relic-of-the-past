/* @layer shared-game @kind logic */
import type { ProgressiveFamilyId, ProgressiveSetting } from '../progressive.type';

const tickedIndexesOf = (setting: ProgressiveSetting, family: ProgressiveFamilyId): readonly number[] => {
  const ticks = setting[family];
  const kept: number[] = [];
  ticks.forEach((ticked, index) => { if (ticked) kept.push(index); });
  return kept;
};

export { tickedIndexesOf };
