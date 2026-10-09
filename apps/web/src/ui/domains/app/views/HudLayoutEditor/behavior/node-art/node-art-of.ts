/* @layer renderer-components @kind logic */
import { glyphArtUrl } from '../glyph-art';
import { PLACEHOLDERS } from './node-art.constants';
import { spriteLabel } from './sprite-label';
import { spriteUrl } from './sprite-url';
import type { GlyphPack, HudElementSpec, HudNode } from '@shared/types/hud';
import type { NodeArt } from './node-art.type';

const specArt = (spec: HudElementSpec, packs: readonly GlyphPack[]): NodeArt => {
  switch (spec.type) {
    case 'sprite':
      return { src: spriteUrl(spec.file), placeholder: '?', name: spriteLabel(spec.file) };
    case 'glyph':
      return spec.slot !== undefined
        ? { placeholder: '▫', name: `glyph of slot ${spec.slot}` }
        : { src: glyphArtUrl(packs, spec.pack, spec.position ?? ''), placeholder: '?', name: spec.position ?? '(none)' };
    case 'button': {
      const idle = spec.states.idle;
      const art = idle.from === 'image'
        ? { src: spriteUrl(idle.file), name: spriteLabel(idle.file) }
        : { src: glyphArtUrl(packs, idle.pack, idle.glyph), name: idle.glyph };
      return { ...art, placeholder: PLACEHOLDERS.button ?? '·' };
    }
    case 'shape':
      return { placeholder: spec.shape === 'heart' ? '♥' : '▮', name: spec.shape };
    case 'slot':
      return { placeholder: '▫', name: `slot ${spec.index}` };
    default:
      return { placeholder: PLACEHOLDERS[spec.type] ?? '·', name: spec.type };
  }
};

const nodeArtOf = (node: HudNode, packs: readonly GlyphPack[]): NodeArt & { kind: string } => {
  if (node.kind === 'container') {
    const kind = node.layout === 'grid' ? 'grid' : node.direction;
    return { placeholder: PLACEHOLDERS.container ?? '▤', name: kind, kind: 'container' };
  }
  return { ...specArt(node.element, packs), kind: node.element.type };
};

export { nodeArtOf };
