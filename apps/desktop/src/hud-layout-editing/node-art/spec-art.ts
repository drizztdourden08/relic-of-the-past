/* @layer renderer-components @kind logic */
import { glyphArtUrl } from '../glyph-art';
import { BLANK_ART, PLACEHOLDERS, UNKNOWN_ART } from './node-art.constants';
import { PLAIN_TYPES } from './spec-art.constants';
import { spriteLabel } from './sprite-label';
import { spriteUrl } from './sprite-url';
import type { GlyphPack } from '@rotp/input-mapping';
import type { HudElementSpec } from '@rotp/hud';
import type { SpecOf } from '../element-spec.type';
import type { NodeArt } from './node-art.type';
import type { PlainSpec } from './spec-art.type';

const isPlain = (spec: HudElementSpec): spec is PlainSpec => PLAIN_TYPES.has(spec.type);

const glyphArt = (spec: SpecOf<'glyph'>, packs: readonly GlyphPack[]): NodeArt => {
  if (spec.slot !== undefined) return { icon: PLACEHOLDERS.slot ?? BLANK_ART, name: `glyph of slot ${spec.slot}` };
  return {
    src: glyphArtUrl(packs, spec.pack, spec.position ?? ''),
    icon: UNKNOWN_ART,
    name: spec.position ?? '(none)',
  };
};

const buttonArt = (spec: SpecOf<'button'>, packs: readonly GlyphPack[]): NodeArt => {
  const idle = spec.states.idle;
  const art = idle.from === 'image'
    ? { src: spriteUrl(idle.file), name: spriteLabel(idle.file) }
    : { src: glyphArtUrl(packs, idle.pack, idle.glyph), name: idle.glyph };
  return { ...art, icon: PLACEHOLDERS.button ?? BLANK_ART };
};

const specArt = (spec: HudElementSpec, packs: readonly GlyphPack[]): NodeArt => {
  if (isPlain(spec)) return { icon: PLACEHOLDERS[spec.type] ?? BLANK_ART, name: spec.type };
  switch (spec.type) {
    case 'sprite':
      return { src: spriteUrl(spec.file), icon: UNKNOWN_ART, name: spriteLabel(spec.file) };
    case 'glyph': return glyphArt(spec, packs);
    case 'button': return buttonArt(spec, packs);
    case 'shape':
      return { icon: spec.shape === 'heart' ? 'heart' : 'square', name: spec.shape };
    case 'slot':
      return { icon: PLACEHOLDERS.slot ?? BLANK_ART, name: `slot ${spec.index}` };
  }
};

export { specArt };
