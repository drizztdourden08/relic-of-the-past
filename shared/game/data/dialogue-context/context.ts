/* @layer shared-game @kind data */
/**
 * What opens each dialogue entry, and, for a prompt, where its options lead.
 * Assembled from the groups in this folder.
 *
 * ## INDEX CONVENTION (read this before touching any number here)
 *
 * Ids are **1-based over the normalized 397-entry array**, exactly matching the
 * `DialogueLine.id` the editor shows. The game core's own counter
 * (`dialogue_message_index`) is **0-based over the same array**, so:
 *
 *     id = dialogue_message_index + 1
 *
 * The 396-vs-397 quirk does NOT shift anything. A ROM that decodes to 396
 * strings is missing one that really is there, and the pipeline puts it back at
 * array position 4 (`normalizeTexts`, build-language-entry.ts) before the blob
 * the core reads is packed. So the core has always been indexing the 397-entry
 * array, and every number below was read off that same array.
 *
 * Proven three ways against a 397-string ROM whose text was decoded
 * independently of this dataset:
 *  1. array position 4 (id 5) in that ROM is byte-for-byte the string the
 *     pipeline injects when a ROM yields only 396, so the injection restores a
 *     real entry instead of inserting a synthetic one;
 *  2. `misc.c:586` picks index 0x184 normally and 0x185 once a certain upgrade
 *     is held; ids 389 and 390 are the two-option and three-option variants of
 *     the same start-location prompt, in that order;
 *  3. `messaging.c:2648/2720/2742/2762` swap in indices 1-2, 6-8, 9-10 and
 *     11-12; ids 2-3, 7-9, 10-11 and 12-13 are exactly the caret-only overlays
 *     for a two-line box, a three-line box, a second two-line box and the
 *     selection-change box. Nothing else in the file looks like those.
 *
 * Further spot checks all landed: index 3 -> id 4 is the post-death save menu
 * (`messaging.c:2146`), 0x7a -> id 123 is the locked-door notice
 * (`dungeon.c:5084`), 123 -> id 124 is the out-of-power notice
 * (`player.c:3286`), and the sign and remote-speech table values land squarely
 * on marker text and remote-speech text respectively.
 *
 * ## What is deliberately absent
 *
 * Four ids carry no entry at all: 1 (the empty leading string), 5 (the control
 * string above, which no call site names), and 39 and 40, whose call path was
 * not found. `contextFor` returns null for those instead of guessing.
 */
import type { DialogueContext } from './types';
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
