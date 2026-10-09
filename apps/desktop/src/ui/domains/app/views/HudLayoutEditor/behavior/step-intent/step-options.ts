/* @layer renderer-components @kind logic */
import { siteOf } from '../node-edits';
import { previousContainer } from './previous-container';
import { stepIntent } from './step-intent';
import type { HudLayout } from '@rotp/hud';
import type { StepDirection, StepOption } from './step-intent.type';

const stepOptions = (doc: HudLayout, id: string): StepOption[] => {
  const site = siteOf(doc, id);
  const parent = site?.parent ?? null;
  const into = parent ? previousContainer(parent, site?.index ?? 0) : null;
  const can = (direction: StepDirection): boolean => stepIntent(doc, id, direction) !== null;
  return [
    { direction: 'up', label: 'Move up', enabled: can('up') },
    { direction: 'down', label: 'Move down', enabled: can('down') },
    { direction: 'out', label: parent ? `Move out of ${parent.id}` : 'Move out', enabled: can('out') },
    { direction: 'in', label: into ? `Move into ${into.id}` : 'Move into...', enabled: can('in') },
  ];
};

export { stepOptions };
