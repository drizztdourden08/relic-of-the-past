/* @layer renderer-components @kind logic */
import { triggerSummary } from './sound-labels';
import type { SoundRowData } from './msu.type';

const soundRowText = (row: SoundRowData): { name: string; under: string } => {
  const { label, triggers, sites } = row;
  const summary = triggerSummary(triggers);
  return {
    name: label ?? (summary.length > 0 ? summary : 'Unnamed sound'),
    under: label !== null ? summary : `${sites} call site${sites === 1 ? '' : 's'}`,
  };
};

export { soundRowText };
