/* @layer shared-other @kind logic */
import { USAGE_LABELS } from './credits.constants';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { UsageLevel } from './credits.type';

const getUsageLabel = (usage: UsageLevel): Message => USAGE_LABELS[usage];

export { getUsageLabel };
