/* @layer renderer-components @kind logic */
import { BLANK_ART, PLACEHOLDERS } from './node-art.constants';
import { typeName } from '../new-node/type-name';
import { specArt } from './spec-art';
import type { Translate } from '../translate.type';
import type { GlyphPack } from '@rotp/input-mapping';
import type { HudNode } from '@rotp/hud';
import type { NodeArt } from './node-art.type';

const nodeArtOf = (node: HudNode, packs: readonly GlyphPack[], t: Translate): NodeArt & { kind: string } => {
  if (node.kind === 'container') {
    const kind = node.layout === 'grid' ? 'grid' : node.direction;
    return { icon: PLACEHOLDERS.container ?? BLANK_ART, name: typeName(t, kind), kind: 'container' };
  }
  return { ...specArt(node.element, packs, t), kind: node.element.type };
};

export { nodeArtOf };
