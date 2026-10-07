/* @layer renderer-components @kind logic */
/**
 * What a REFERENCE to another node should show: its picture where the editor
 * owns one, a human name, and the kind it is.
 *
 * A switch case and a repeat's child are references to whole subtrees, and
 * today both print `sprite hud-silver-arrow-icon · sprite-3f21`, which is an id the
 * author never chose next to a slug they never typed. The editor already owns
 * the artwork for the two kinds that carry any (`sprite`, `glyph`, and a
 * `button`'s idle face, which is one of those two), so a reference to one of
 * them can draw it; everything else gets a one-character stand-in and its
 * name, which is still a name and not an identifier.
 *
 * THE ID IS NOT DROPPED, IT IS DEMOTED. `ReferenceField` renders `kind` as the
 * dim half of the label, so "which of the two sprite children is this" is
 * still answerable. It just stops being the first thing read.
 */
import { getSpritesBase } from '@shared/game/logic/queries/item-sprites';
import { SPRITE_MANIFEST } from '@shared/game/data/sprite-manifest/manifest';
import { glyphArtUrl } from './glyph-art';
import type { GlyphPack, HudElementSpec, HudNode } from '@shared/types/hud';

interface NodeArt {
  /** A real image, or `undefined` for "there is no artwork for this kind". */
  src?: string;
  /** What `Thumbnail` draws instead of a broken image. */
  placeholder: string;
  /** The human name, first half of the label. */
  name: string;
}

const spriteUrl = (file: string): string => `${getSpritesBase()}${file}.png`;

const spriteLabel = (file: string): string =>
  SPRITE_MANIFEST.find((sprite) => sprite.file === file)?.label ?? file;

/** One character per kind. Each is a stand-in with a shape, not a `?`. */
const PLACEHOLDERS: Readonly<Record<string, string>> = {
  text: 'T', shape: '♥', slot: '▫', spacer: '␣', repeat: '⧉', switch: '⑂', button: '⊙', countdown: '◔',
  container: '▤',
};

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

/** A node as a reference: what to draw, what to call it, and what kind it is. */
const nodeArtOf = (node: HudNode, packs: readonly GlyphPack[]): NodeArt & { kind: string } => {
  if (node.kind === 'container') {
    const kind = node.layout === 'grid' ? 'grid' : node.direction;
    return { placeholder: PLACEHOLDERS.container ?? '▤', name: kind, kind: 'container' };
  }
  return { ...specArt(node.element, packs), kind: node.element.type };
};

export { nodeArtOf, spriteLabel, spriteUrl };
export type { NodeArt };
