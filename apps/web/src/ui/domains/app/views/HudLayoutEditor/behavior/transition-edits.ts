/* @layer renderer-components @kind logic */
/**
 * `node.transition` is ONE object holding two unrelated ideas. They are the value
 * transitions (a bound number changed, ease toward it) and enter/exit (this
 * node arrived or left). Phase 10 puts them in two different subsections of
 * Motion, which means two editors writing one field, which means the merge has
 * to live somewhere neither of them owns: unchecking the last property must
 * not discard an enter the other subsection just set, and clearing an exit
 * must not discard the properties.
 *
 * THE OBJECT COLLAPSES TO `undefined` ONLY WHEN NOTHING IS LEFT IN IT AT ALL.
 * No properties, no enter, no exit. That rule was already in the old
 * `TransitionsSection`; it is here now because there are two callers.
 *
 * WHICH PROPERTIES "ACTUALLY MOVE" IS AN ANNOTATION, NOT A FILTER. The old
 * section listed only the properties a bound value could drive and silently
 * omitted the rest, so an author who expected `opacity` was told nothing at
 * all. Every property is offered; `drivenProperties` says which ones something
 * currently drives, and the row wearing one that nothing drives says so.
 */
import { collectBoundValues } from './bound-values';
import type { HudNode, HudTransition, HudTransitionProperty } from '@shared/types/hud';

/** All six, in the document model's own order (`hud-motion.ts`). */
const TRANSITION_PROPERTIES: readonly HudTransitionProperty[] = [
  'size', 'position', 'opacity', 'scale', 'tint', 'color',
];

const DEFAULT_DURATION = 200;

/**
 * Which of the six something on THIS node currently drives. It is a best-effort
 * reading of its bound values, unchanged from the old section's inference
 * except that it now annotates instead of filtering. `position` is offered as
 * driven only inside a `repeat`: that is the one case this model has where a
 * node's placement moves without a bound field of its own naming it.
 */
const drivenProperties = (node: HudNode, insideRepeat: boolean): ReadonlySet<HudTransitionProperty> => {
  const bound = collectBoundValues(node).map((b) => b.path);
  const has = (prefix: string): boolean =>
    bound.some((p) => p === prefix || p.startsWith(`${prefix}.`) || p.startsWith(`${prefix}[`));
  const driven = new Set<HudTransitionProperty>();
  if (has('size') || has('min') || has('max')) driven.add('size');
  if (insideRepeat) driven.add('position');
  if (has('opacity')) driven.add('opacity');
  if (has('scale')) driven.add('scale');
  if (has('style.tint')) driven.add('tint');
  if (has('style.background') || has('element.color')) driven.add('color');
  return driven;
};

/**
 * `patch` merged onto whatever `transition` already holds, collapsed to
 * `undefined` when the result carries nothing. The ONE write both subsections
 * make, so neither can drop the other's field.
 */
const mergeTransition = (
  transition: HudTransition | undefined, patch: Partial<HudTransition>,
): HudTransition | undefined => {
  const next: HudTransition = {
    properties: transition?.properties ?? [],
    duration: transition?.duration ?? DEFAULT_DURATION,
    ...(transition?.easing !== undefined ? { easing: transition.easing } : {}),
    ...(transition?.when !== undefined ? { when: transition.when } : {}),
    ...(transition?.enter !== undefined ? { enter: transition.enter } : {}),
    ...(transition?.exit !== undefined ? { exit: transition.exit } : {}),
    ...patch,
  };
  // An explicit `undefined` in the patch means "clear this", which spreading
  // reinstates as a present-but-undefined key; strip those so the saved
  // document has no `"easing": undefined` to round-trip through JSON.
  if (next.easing === undefined) delete next.easing;
  if (next.when === undefined) delete next.when;
  if (next.enter === undefined) delete next.enter;
  if (next.exit === undefined) delete next.exit;
  const empty = next.properties.length === 0 && next.enter === undefined && next.exit === undefined;
  return empty ? undefined : next;
};

export { DEFAULT_DURATION, drivenProperties, mergeTransition, TRANSITION_PROPERTIES };
