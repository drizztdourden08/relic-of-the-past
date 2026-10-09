/* @layer renderer-components @kind logic */
import { rootsOf } from './roots-of';
import type { HudLayout, HudNode } from '@shared/types/hud';

const isInsideRepeat = (doc: HudLayout, id: string): boolean => {
  let result = false;
  let hit = false;
  const visit = (node: HudNode, insideRepeat: boolean): void => {
    if (hit) return;
    if (node.id === id) { result = insideRepeat; hit = true; return; }
    if (node.kind === 'container') { node.children.forEach((child) => visit(child, insideRepeat)); return; }
    const { element } = node;
    if (element.type === 'repeat') visit(element.child, true);
    else if (element.type === 'switch') {
      element.cases.forEach((c) => visit(c.node, insideRepeat));
      if (element.otherwise) visit(element.otherwise, insideRepeat);
    }
  };
  rootsOf(doc).forEach((root) => visit(root, false));
  return result;
};

export { isInsideRepeat };
