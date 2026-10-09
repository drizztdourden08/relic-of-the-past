/* @layer renderer-components @kind logic */
import type { HudNode } from '@rotp/hud';

const slotsOf = (node: HudNode): number[] => {
  if (node.kind !== 'element') return [];
  const spec = node.element;
  if (spec.type === 'slot') return [spec.index];
  if (spec.type === 'glyph' && spec.slot !== undefined) return [spec.slot];
  if (spec.type === 'button' && spec.bind.kind === 'slot') return [spec.bind.index];
  return [];
};

export { slotsOf };
