/* @layer shared-other @kind logic */
import { USAGE_LABELS } from './credits.constants';
import type { UsageLevel } from './credits.type';

const getUsageLabel = (usage: UsageLevel): string => USAGE_LABELS[usage];

export { getUsageLabel };
