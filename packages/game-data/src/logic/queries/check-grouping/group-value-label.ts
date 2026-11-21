/* @layer shared-game @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { FIXED_GROUP_VALUE_LABELS, SPHERE_PREFIX } from './group-value-label.constants';

const groupValueLabel = (value: string): Text => {
  const fixed = FIXED_GROUP_VALUE_LABELS[value];
  if (fixed !== undefined) return fixed;
  if (!value.startsWith(SPHERE_PREFIX)) return value;
  return msg('game-labels:group.sphere', { n: Number(value.slice(SPHERE_PREFIX.length)) });
};

export { groupValueLabel };
