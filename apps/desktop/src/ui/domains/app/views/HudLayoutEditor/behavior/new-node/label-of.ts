/* @layer renderer-components @kind logic */
import type { HudNode } from '@rotp/hud';

const labelOf = (node: HudNode): string => {
  if (node.kind === 'container') return node.layout === 'grid' ? 'grid' : node.direction;
  const spec = node.element;
  switch (spec.type) {
    case 'glyph':
      return spec.slot !== undefined ? `glyph of slot ${spec.slot}` : `glyph ${spec.position ?? '?'}`;
    case 'slot': return `slot ${spec.index}`;
    case 'sprite': return `sprite ${spec.file}`;
    case 'button': return spec.bind.kind === 'slot' ? `button (slot ${spec.bind.index})` : `button (${spec.bind.verb})`;
    case 'countdown': return spec.variant && spec.variant !== 'setting' ? `countdown (${spec.variant})` : 'countdown';
    default: return spec.type;
  }
};

export { labelOf };
