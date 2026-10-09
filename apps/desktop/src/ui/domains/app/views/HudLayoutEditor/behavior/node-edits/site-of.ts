/* @layer renderer-components @kind logic */
import { walkNodes } from './walk-nodes';
import type { HudLayout } from '@shared/types/hud';
import type { NodeSite } from './node-edits.type';

const siteOf = (doc: HudLayout, id: string): NodeSite | null =>
  walkNodes(doc).find((site) => site.node.id === id) ?? null;

export { siteOf };
