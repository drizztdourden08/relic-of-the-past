/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import { PROGRESSIVE_MODES } from './progressive-modes';
import type { OptionChoice } from '../options.type';
import type { ProgressiveFamilyMode } from './progressive.type';

const MODE_SOURCE_VALUE: Readonly<Record<ProgressiveFamilyMode, number>> ={ progressive: 2, random: 0 };

const MODE_LABEL_MESSAGES: Readonly<Record<ProgressiveFamilyMode, Message>> = {
  progressive: msg('randomizer-world:choice.order.progressive'),
  random: msg('randomizer-world:choice.order.random'),
};

const MODE_CHOICES: readonly OptionChoice[] = PROGRESSIVE_MODES.map((mode) => ({
  value: mode,
  sourceValue: MODE_SOURCE_VALUE[mode],
  label: MODE_LABEL_MESSAGES[mode],
}));

export { MODE_CHOICES };
