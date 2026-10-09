/* @layer shared-game @kind logic */
import { enumerationFor } from '../../../data';
import { PROGRESS_TIER_CATEGORY } from './progress-tier.constants';

const progressTierOptions = (): readonly { value: number; label: string }[] =>
  enumerationFor(PROGRESS_TIER_CATEGORY)
    .map(entry => ({ value: Number(entry.value), label: entry.label }))
    .filter(option => Number.isInteger(option.value))
    .sort((a, b) => a.value - b.value);

export { progressTierOptions };
