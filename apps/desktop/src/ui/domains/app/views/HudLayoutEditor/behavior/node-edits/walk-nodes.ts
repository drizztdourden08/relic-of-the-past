/* @layer renderer-components @kind logic */
import { embeddedOf } from './embedded-of';
import type { HudContainer, HudLayout, HudNode } from '@rotp/hud';
import type { NodeSite } from './node-edits.type';

const childrenOf = (node: HudNode): readonly HudNode[] =>
  node.kind === 'container' ? node.children : [];

const walkNodes = (doc: HudLayout): NodeSite[] => {
  const out: NodeSite[] = [];
  const visit = (node: HudNode, parent: HudContainer | null, index: number): void => {
    out.push({ node, parent, index });
    childrenOf(node).forEach((child, at) => visit(child, node as HudContainer, at));
    embeddedOf(node).forEach((child, at) => visit(child, null, at));
  };
  visit(doc.screen, null, 0);
  return out;
};

export { walkNodes };
