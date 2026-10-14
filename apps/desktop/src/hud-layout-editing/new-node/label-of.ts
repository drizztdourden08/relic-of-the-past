/* @layer renderer-components @kind logic */
import { PLAIN_TYPES } from './label-of.constants';
import type { HudContainer, HudElementSpec, HudNode } from '@rotp/hud';
import type { SpecOf } from '../element-spec.type';
import type { PlainSpec } from './label-of.type';

const isPlain = (spec: HudElementSpec): spec is PlainSpec => PLAIN_TYPES.has(spec.type);

const containerLabel = (node: HudContainer): string => (node.layout === 'grid' ? 'grid' : node.direction);

const glyphLabel = (spec: SpecOf<'glyph'>): string =>
  (spec.slot !== undefined ? `glyph of slot ${spec.slot}` : `glyph ${spec.position ?? '?'}`);

const buttonLabel = (spec: SpecOf<'button'>): string =>
  (spec.bind.kind === 'slot' ? `button (slot ${spec.bind.index})` : `button (${spec.bind.verb})`);

const countdownLabel = (spec: SpecOf<'countdown'>): string =>
  (spec.variant && spec.variant !== 'setting' ? `countdown (${spec.variant})` : 'countdown');

const elementLabel = (spec: HudElementSpec): string => {
  if (isPlain(spec)) return spec.type;
  switch (spec.type) {
    case 'glyph': return glyphLabel(spec);
    case 'slot': return `slot ${spec.index}`;
    case 'sprite': return `sprite ${spec.file}`;
    case 'button': return buttonLabel(spec);
    case 'countdown': return countdownLabel(spec);
  }
};

const labelOf = (node: HudNode): string =>
  (node.kind === 'container' ? containerLabel(node) : elementLabel(node.element));

export { labelOf };
