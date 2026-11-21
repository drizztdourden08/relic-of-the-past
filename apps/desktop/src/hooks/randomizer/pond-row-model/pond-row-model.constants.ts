/* @layer renderer-hooks @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message, Text } from '@drizztdourden08/brock-core/i18n';
import { CURVE_LABELS } from '@rotp/randomizer';
import type { PondSetting } from '@rotp/randomizer';
import type { PondLadderFields } from './pond-row-model.type';

const MODE_LABELS: Readonly<Record<PondSetting['mode'], Message>> = {
  capacity: msg('randomizer:pond-row.mode.capacity'),
  'vanilla-cost': msg('randomizer:pond-row.mode.vanilla-cost'),
  custom: msg('randomizer:pond-row.mode.custom'),
};

const FREE_PRICE_LABEL = msg('randomizer:pond-row.price.free');

const curveOptionsOf = (text: (text: Text) => string) => (['equal', 'front', 'ramp', 'reverse-fib', 'geometric', 'free'] as const)
  .map((curve) => ({ value: curve, label: text(CURVE_LABELS[curve]) }));

const DEFAULT_CUSTOM_POND: PondLadderFields ={ start: 100, max: 300, throws: 7, shape: { curve: 'equal' } };

export { curveOptionsOf, DEFAULT_CUSTOM_POND, FREE_PRICE_LABEL, MODE_LABELS };
