/* @layer renderer-components @kind logic */
import { siteOf } from '../node-edits';
import { nodeName } from '../node-name';
import { previousContainer } from './previous-container';
import { stepIntent } from './step-intent';
import type { HudLayout } from '@rotp/hud';
import type { Translate } from '../translate.type';
import type { StepDirection, StepOption } from './step-intent.type';

const stepOptions = (doc: HudLayout, id: string, t: Translate): StepOption[] => {
  const site = siteOf(doc, id);
  const parent = site?.parent ?? null;
  const into = parent ? previousContainer(parent, site?.index ?? 0) : null;
  const can = (direction: StepDirection): boolean => stepIntent(doc, id, direction) !== null;
  return [
    { direction: 'up', label: t('hud-editing:step.up'), enabled: can('up') },
    { direction: 'down', label: t('hud-editing:step.down'), enabled: can('down') },
    { direction: 'out', label: parent ? t('hud-editing:step.out-of', { id: nodeName(parent.id, t) }) : t('hud-editing:step.out'), enabled: can('out') },
    { direction: 'in', label: into ? t('hud-editing:step.into', { id: nodeName(into.id, t) }) : t('hud-editing:step.into-ask'), enabled: can('in') },
  ];
};

export { stepOptions };
