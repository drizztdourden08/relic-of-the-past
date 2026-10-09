/* @layer shared-other @kind logic */
import { USAGE_LABELS } from './credits.data';
import type { UsageLevel } from './credits.type';

const getUsageLabel = (usage: UsageLevel): string => USAGE_LABELS[usage];

export { getUsageLabel };
