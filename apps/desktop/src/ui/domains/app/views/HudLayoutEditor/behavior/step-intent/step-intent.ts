/* @layer renderer-components @kind logic */
import { refusalFor } from '../drop-intent';
import { siteOf } from '../node-edits';
import { previousContainer } from './previous-container';
import type { DropIntent } from '../drop-intent';
import type { HudContainer, HudLayout } from '@shared/types/hud';
import type { StepDirection } from './step-intent.type';

const grandparentOf = (doc: HudLayout, parent: HudContainer): { node: HudContainer; index: number } | null => {
  const above = siteOf(doc, parent.id);
  return above?.parent ? { node: above.parent, index: above.index } : null;
};

const targetFor = (
  doc: HudLayout, id: string, direction: StepDirection,
): { parentId: string; index: number } | null => {
  const site = siteOf(doc, id);
  if (!site?.parent) return null;
  const { parent, index } = site;
  if (direction === 'up') return index > 0 ? { parentId: parent.id, index: index - 1 } : null;
  if (direction === 'down') {
    return index < parent.children.length - 1 ? { parentId: parent.id, index: index + 1 } : null;
  }
  if (direction === 'out') {
    const above = grandparentOf(doc, parent);
    return above ? { parentId: above.node.id, index: above.index + 1 } : null;
  }
  const into = previousContainer(parent, index);
  return into ? { parentId: into.id, index: into.children.length } : null;
};

const stepIntent = (doc: HudLayout, id: string, direction: StepDirection): DropIntent | null => {
  const target = targetFor(doc, id, direction);
  if (!target) return null;
  const stop = refusalFor(doc, [id], target.parentId);
  if (stop) return { kind: 'refused', reason: stop.reason, parentId: target.parentId, nodeId: stop.nodeId };
  return { kind: 'flex', parentId: target.parentId, index: target.index };
};

export { stepIntent };
