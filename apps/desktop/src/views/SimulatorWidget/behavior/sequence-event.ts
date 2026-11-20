/* @layer renderer-widgets @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { SimEvent } from '@rotp/navigation';
import { wasmGetProgressIndicator } from '@app/game';
import { codedEvent } from './coded-event';

const sequenceEvent = (lastLabel: string | null, step: number): SimEvent | null => {
  const label = wasmGetProgressIndicator()?.label ?? null;
  if (!label || label === lastLabel) return null;
  return codedEvent('sequence', msg('views-simulator:event.sequence', { label }), step, { label });
};

export { sequenceEvent };
