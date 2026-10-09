/* @layer renderer-components @kind logic */
import type { HudLayout, HudNode } from '@shared/types/hud';
import type { OutlineRowModel } from '../sub-components/OutlinePanel.type';

const hasSubtree = (node: HudNode): boolean => {
  if (node.kind === 'container') return node.children.length > 0;
  return node.element.type === 'repeat' || node.element.type === 'switch';
};

const cellLabel = (node: HudNode): string | undefined => {
  const { column, row } = node.place ?? {};
  return column !== undefined && row !== undefined ? `${column},${row}` : undefined;
};

const outlineRows = (doc: HudLayout, collapsedIds: ReadonlySet<string>): OutlineRowModel[] => {
  const rows: OutlineRowModel[] = [];
  const visit = (node: HudNode, depth: number, cell?: string, locked?: string): void => {
    const hasChildren = hasSubtree(node);
    const collapsed = hasChildren && collapsedIds.has(node.id);
    rows.push({
      node, depth, cell, locked, hasChildren, collapsed,
    });
    if (collapsed) return;
    if (node.kind === 'container') { node.children.forEach((child) => visit(child, depth + 1)); return; }
    const { element } = node;
    if (element.type === 'repeat') visit(element.child, depth + 1, undefined, 'repeat child');
    else if (element.type === 'switch') {
      element.cases.forEach((c, i) => visit(c.node, depth + 1, undefined, `case ${i + 1}`));
      if (element.otherwise) visit(element.otherwise, depth + 1, undefined, 'otherwise');
    }
  };
  const screenHasChildren = doc.screen.children.length > 0;
  const screenCollapsed = screenHasChildren && collapsedIds.has(doc.screen.id);
  rows.push({
    node: doc.screen, depth: 0, isScreen: true, hasChildren: screenHasChildren, collapsed: screenCollapsed,
  });
  if (!screenCollapsed) doc.screen.children.forEach((child) => visit(child, 1, cellLabel(child)));
  return rows;
};

export { outlineRows };
