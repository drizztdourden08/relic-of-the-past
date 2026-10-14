/* @layer renderer-components @kind logic */
import { BLANK_ART, PLACEHOLDERS } from './node-art.constants';
import { specArt } from './spec-art';
import type { GlyphPack } from '@rotp/input-mapping';
import type { HudNode } from '@rotp/hud';
import type { NodeArt } from './node-art.type';

const nodeArtOf = (node: HudNode, packs: readonly GlyphPack[]): NodeArt & { kind: string } => {
  if (node.kind === 'container') {
    const kind = node.layout === 'grid' ? 'grid' : node.direction;
    return { icon: PLACEHOLDERS.container ?? BLANK_ART, name: kind, kind: 'container' };
  }
  return { ...specArt(node.element, packs), kind: node.element.type };
};

export { nodeArtOf };
