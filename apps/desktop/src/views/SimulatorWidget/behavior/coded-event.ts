/* @layer renderer-widgets @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { optionText } from '@rotp/randomizer';
import type { SimEvent } from '@rotp/navigation';
import type { LogCode } from '../SimulatorWidget.type';

const codedEvent = (code: LogCode, text: Text, step: number, extra: object = {}): SimEvent => ({
  level: 'narrative',
  msg: optionText(text),
  step,
  data: { logCode: code, ...extra },
});

export { codedEvent };
