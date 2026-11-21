/* @layer renderer-components @kind logic */
import { PLAIN_TYPES } from './label-of.constants';
import { typeName } from './type-name';
import type { HudContainer, HudElementSpec, HudNode } from '@rotp/hud';
import type { Translate } from '../translate.type';
import type { SpecOf } from '../element-spec.type';
import type { PlainSpec } from './label-of.type';

const isPlain = (spec: HudElementSpec): spec is PlainSpec => PLAIN_TYPES.has(spec.type);

const containerLabel = (node: HudContainer, t: Translate): string =>
  typeName(t, node.layout === 'grid' ? 'grid' : node.direction);

const glyphLabel = (spec: SpecOf<'glyph'>, t: Translate): string =>
  (spec.slot !== undefined
    ? t('hud-editing:label.glyph-slot', { slot: spec.slot })
    : t('hud-editing:label.glyph', { position: spec.position ?? '?' }));

const buttonLabel = (spec: SpecOf<'button'>, t: Translate): string =>
  (spec.bind.kind === 'slot'
    ? t('hud-editing:label.button-slot', { slot: spec.bind.index })
    : t('hud-editing:label.button-verb', { verb: spec.bind.verb }));

const countdownLabel = (spec: SpecOf<'countdown'>, t: Translate): string =>
  (spec.variant && spec.variant !== 'setting'
    ? t('hud-editing:label.countdown-variant', { variant: spec.variant })
    : t('hud-editing:node.countdown'));

const elementLabel = (spec: HudElementSpec, t: Translate): string => {
  if (isPlain(spec)) return typeName(t, spec.type);
  switch (spec.type) {
    case 'glyph': return glyphLabel(spec, t);
    case 'slot': return t('hud-editing:label.slot', { index: spec.index });
    case 'sprite': return t('hud-editing:label.sprite', { file: spec.file });
    case 'button': return buttonLabel(spec, t);
    case 'countdown': return countdownLabel(spec, t);
  }
};

const labelOf = (node: HudNode, t: Translate): string =>
  (node.kind === 'container' ? containerLabel(node, t) : elementLabel(node.element, t));

export { labelOf };
