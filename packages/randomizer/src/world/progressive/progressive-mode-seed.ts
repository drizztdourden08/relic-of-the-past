/* @layer shared-game @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { progressiveFamilyName } from './progressive-display-names';
import { progressiveModeKeyOf } from './progressive-mode-keys';
import { MODE_CHOICES } from './progressive-mode-choices.constants';
import type { OptionSeed } from '../options.type';
import type { ProgressiveFamilyDef } from './progressive.type';

const progressiveModeSeed = (family: ProgressiveFamilyDef): OptionSeed => ({
  key: progressiveModeKeyOf(family.id),
  displayName: msg('randomizer-world:tpl.progressive.mode', { family: progressiveFamilyName(family) }),
  group: 'items',
  kind: 'choice',
  implementation: 'active',
  choices: MODE_CHOICES,
  sourceDefault: 'progressive',
  baseline: 'progressive',
  locked: false,
  synthetic: true,
});

export { progressiveModeSeed };
