/* @layer renderer-widgets @kind logic */
import type { SimEvent } from '@rotp/navigation';
import { CLASSIFY_RULES, CODE_STYLES, DEBUG_STYLE, INFO_STYLE } from './classify-event.constants';
import { logCodeOf } from './coded-event';
import type { LogStyle } from '../SimulatorWidget.type';

const classifyEvent = (event: SimEvent): LogStyle => {
  const code = logCodeOf(event);
  if (code) return CODE_STYLES[code];
  const rule = CLASSIFY_RULES.find(({ pattern }) => pattern.test(event.msg));
  if (rule) return rule.style;
  return event.level === 'debug' ? DEBUG_STYLE : INFO_STYLE;
};

export { classifyEvent };
