/* @layer renderer-components @kind logic */
import { rootsOf } from './roots-of';
import type { HudLayout, HudNode, Value } from '@rotp/hud';

const enclosingRepeatOf = (doc: HudLayout, id: string): { count: Value; item?: string } | null => {
  let found: { count: Value; item?: string } | null = null;
  let hit = false;
  const visit = (node: HudNode, repeat: { count: Value; item?: string } | null): void => {
    if (hit) return;
    if (node.id === id) { found = repeat; hit = true; return; }
    if (node.kind === 'container') { node.children.forEach((child) => visit(child, repeat)); return; }
    const { element } = node;
    if (element.type === 'repeat') visit(element.child, { count: element.count, item: element.item });
    else if (element.type === 'switch') {
      element.cases.forEach((c) => visit(c.node, repeat));
      if (element.otherwise) visit(element.otherwise, repeat);
    }
  };
  rootsOf(doc).forEach((root) => visit(root, null));
  return found;
};

export { enclosingRepeatOf };
