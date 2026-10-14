/* @layer renderer-widgets @kind logic */
import type { SimEvent } from '@rotp/navigation';
import { CLASSIFY_RULES } from './classify-event.constants';
import type { LogStyle } from '../SimulatorWidget.type';

const classifyEvent = (event: SimEvent): LogStyle => {
  const rule = CLASSIFY_RULES.find(({ pattern }) => pattern.test(event.msg));
  if (rule) return rule.style;
  if (event.level === 'debug') return { kind: 'debug', tag: 'DBG' };
  return { kind: 'info', tag: 'INFO' };
};

export { classifyEvent };
