/* @layer shared-game @kind logic */
import type { DialogueContext } from './dialogue-context.type';
import { tableGroups } from './table-groups';
import { siteGroups } from './site-groups';
import { dialogueChoices } from './choices';

const buildContexts = (): Map<number, DialogueContext> => {
  const out = new Map<number, DialogueContext>();

  for (const group of tableGroups) {
    for (const id of group.ids) out.set(id, { id, trigger: group.trigger, source: group.source });
  }
  for (const group of siteGroups) {
    for (const [id, line] of group.sites) {
      out.set(id, { id, trigger: group.trigger, source: `${group.file}:${line}` });
    }
  }
  for (const row of dialogueChoices) {
    const base = out.get(row.id) ?? { id: row.id, trigger: 'unknown' as const };
    out.set(row.id, { ...base, choice: { options: row.options, outcomes: row.outcomes } });
  }

  return out;
};

const dialogueContexts: Map<number, DialogueContext> = buildContexts();

export { dialogueContexts };
