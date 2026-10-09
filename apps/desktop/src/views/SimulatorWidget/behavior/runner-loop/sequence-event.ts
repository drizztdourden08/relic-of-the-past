/* @layer renderer-widgets @kind logic */
import type { SimEvent } from '@rotp/navigation';
import { wasmGetProgressIndicator } from '@app/game';
import { SEQUENCE_PREFIX } from '../../SimulatorWidget.constants';

const sequenceEvent = (lastLabel: string | null, step: number): SimEvent | null => {
  const label = wasmGetProgressIndicator()?.label ?? null;
  if (!label || label === lastLabel) return null;
  return { level: 'narrative', msg: `${SEQUENCE_PREFIX}${label}`, step };
};

export { sequenceEvent };
