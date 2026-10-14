/* @layer renderer-components @kind logic */
import { boundCountsBySection } from '../bound-values';
import { instanceScopes } from '../formula-scope';
import { walkNodes } from '../node-edits';
import { enclosingRepeatOf, isInsideRepeat, realParentOf } from '../tree-context';
import type { HudLayout, HudNode } from '@rotp/hud';
import type { InspectorContext } from './inspector-sections.type';

const inspectorContextOf = (
  doc: HudLayout, node: HudNode, scope: Readonly<Record<string, number>>, reflowWarnings: readonly string[],
): InspectorContext => ({
  isScreen: doc.screen.id === node.id,
  otherIds: walkNodes(doc).map((site) => site.node.id).filter((id) => id !== node.id),
  parent: realParentOf(doc, node.id),
  insideRepeat: isInsideRepeat(doc, node.id),
  instances: instanceScopes(enclosingRepeatOf(doc, node.id), scope),
  counts: boundCountsBySection(node),
  warnings: reflowWarnings.filter((w) => w.startsWith(`${node.id}:`)),
});

export { inspectorContextOf };
