/* @layer renderer-components @kind logic */
import type { ProgressTone } from '@drizztdourden08/tessera/primitives';
import type { TextLimit } from '@shared/game/language';
import type { SlotFit } from './text-groups.type';

const variantFor = (used: number, max: number): ProgressTone => {
  if (used > max) return 'danger';
  if (used >= max) return 'gold';
  return 'green';
};

const fitOf = (limit: TextLimit, value: string): SlotFit | null => {
  if (limit.kind === 'none') return null;

  const used = [...value].length;
  const unit = limit.kind === 'glyphs' ? 'characters' : 'tiles';
  const rows = limit.kind === 'glyphs' && limit.lines ? ` over ${limit.lines} lines` : '';

  const lines = limit.kind === 'glyphs' && limit.lines ? ` x${limit.lines}` : '';

  return {
    used,
    max: limit.max,
    variant: variantFor(used, limit.max),
    readout: `${used}/${limit.max}${lines}`,
    detail: `${used} of ${limit.max} ${unit}${rows}`,
  };
};

export { fitOf };
