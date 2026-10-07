/* @layer renderer-components @kind logic */
/**
 * THE THIRD PRODUCER. It turns a node and one of four directions into the same
 * `DropIntent` the two pointer surfaces make.
 *
 * §38.2 replaced a track-reorder drag with two arrow buttons and said the thing
 * this file exists for: it was "the one affordance here a keyboard could not
 * reach". Reparenting is the primary structural edit in this editor, not a
 * decoration, and until now it was pointer-only. This is that rule applied to
 * the gesture it was written for.
 *
 * IT IS NOT A HIT TEST AT ALL, which is the point. The intent is computed from
 * the TREE, and then handed to the same `applyDrop` a drop from the stage or the
 * outline goes through, so the keyboard cannot reach a state the pointer could
 * not, and a refusal reads the same sentence in both. That is the shared
 * resolver earning its keep in the place it was least obviously needed.
 *
 * THE VOCABULARY IS BORROWED, NOT INVENTED. Reorder on up/down and
 * promote/demote on left/right is every outline editor since the first one:
 * Word's outline view, OmniOutliner, Blender's outliner, every Markdown list
 * editor. Nobody has to be taught it.
 *
 * `null` AND `refused` ARE DIFFERENT ANSWERS. `null` means there is nowhere to
 * go (already first, already last, no previous sibling), and the row shakes
 * instead of saying anything, because "you are at the top of a list" is
 * something the list itself already shows. A `refused` intent means there IS a
 * target and it is illegal, which is a sentence and gets announced.
 */
import { refusalFor } from './drop-intent';
import { siteOf } from './node-edits';
import type { DropIntent } from './drop-intent';
import type { HudContainer, HudLayout } from '@shared/types/hud';

/** Up/down reorder among siblings; out/in promote and demote. */
type StepDirection = 'up' | 'down' | 'out' | 'in';

/** One menu row: what it would do, and whether it can. */
interface StepOption { direction: StepDirection; label: string; enabled: boolean }

/** The parent an `out` would move into, and where the old parent sits in it. */
const grandparentOf = (doc: HudLayout, parent: HudContainer): { node: HudContainer; index: number } | null => {
  const above = siteOf(doc, parent.id);
  return above?.parent ? { node: above.parent, index: above.index } : null;
};

/** The container an `in` would append to: the previous sibling, if it is one. */
const previousContainer = (parent: HudContainer, index: number): HudContainer | null => {
  const before = index > 0 ? parent.children[index - 1] : undefined;
  return before?.kind === 'container' ? before : null;
};

/** Where the step would put the node, before validity has been consulted. */
const targetFor = (
  doc: HudLayout, id: string, direction: StepDirection,
): { parentId: string; index: number } | null => {
  const site = siteOf(doc, id);
  // The screen, a repeat's child and a switch's case have no array to splice.
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

/**
 * One keyboard move, as an intent. `null` when there is nowhere to go at all.
 */
const stepIntent = (doc: HudLayout, id: string, direction: StepDirection): DropIntent | null => {
  const target = targetFor(doc, id, direction);
  if (!target) return null;
  const stop = refusalFor(doc, [id], target.parentId);
  if (stop) return { kind: 'refused', reason: stop.reason, parentId: target.parentId, nodeId: stop.nodeId };
  return { kind: 'flex', parentId: target.parentId, index: target.index };
};

/**
 * The four operations as menu rows, in the order the wireframe draws them.
 *
 * A DIMMED ITEM THAT NAMES ITS OWN PRECONDITION TEACHES THE RULE; a missing item
 * teaches nothing. So `Move out of hud` keeps the parent's name even when the
 * parent is the screen and the item is dead, and `Move into...` stays an ellipsis
 * until there is a previous sibling to name.
 */
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

/** Which arrow means which direction. The row handler and the menu's own
 *  shortcut column read this one map, so a hint can never name a key that does
 *  something else. */
const STEP_KEYS: Readonly<Record<string, StepDirection>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'out',
  ArrowRight: 'in',
};

const ARROW: Readonly<Record<StepDirection, string>> = {
  up: '↑', down: '↓', out: '←', in: '→',
};

export { ARROW, STEP_KEYS, stepIntent, stepOptions };
export type { StepDirection, StepOption };
