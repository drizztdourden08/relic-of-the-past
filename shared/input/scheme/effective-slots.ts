/* @layer shared-input @kind logic */
/**
 * The one rule for "which slots does this profile have RIGHT NOW".
 *
 * THE STORED LIST IS THE TRUTH, and that reverses what this file used to say.
 * Slots were derived on every read from the live control list, filtered to two
 * categories, minus the core's claimed positions, so the list could only ever
 * be as long as the device allowed and the player could not add to it. Now the
 * list is the player's: it is prefilled from the device once (`defaultSlotList`)
 * and thereafter read back as written, so a slot they added survives, a slot
 * they removed stays removed, and a thirty-button pad is thirty rows.
 *
 * What the derived-on-read rule bought was that a stored list could never go
 * stale against a core rebind: moving movement to the stick freed the d-pad on
 * every screen at once. Numbering buys the same guarantee differently, because every
 * lens reads the SAME stored list instead of each rebuilding one. The
 * cost is that binding a gameplay verb onto a slot's control no longer makes
 * that slot vanish. It fires both, the controls screen shows both rows, and
 * removing one is one click. That is a visible clash the player made, which is
 * a better failure than a row disappearing out from under them.
 *
 * ORDER, and why the stored list comes first:
 *  1. The profile's stored slots, renumbered. What the player built.
 *  2. The keyboard preset, for a keyboard profile that has never been edited.
 *     SDL never enumerates a keyboard, so there is no control list to prefill
 *     from.
 *  3. The live control list, for a gamepad profile that has never been edited.
 *  4. Nothing. A gamepad profile with no stored list and no connected pad has
 *     no honest answer, and inventing one would fabricate controls.
 */
import { defaultSlotList } from './derive-slots';
import { keyboardModernBindings } from './default-modern-bindings';
import { renumberSlots } from './slot-list';
import type { ResolvedControl } from '../family/family.type';
import type { CoreBindings, ModernBindings, ModernSlot } from '../../types/controls';

interface SlotSource {
  /** The EFFECTIVE core, whether a stored rebind or a default produced it. */
  core: CoreBindings;
  /** What the device reports right now. Empty when none is connected. */
  controls?: readonly ResolvedControl[];
  /** True for a keyboard profile, whose preset stands in for a control list. */
  keyboard?: boolean;
  /** The profile's stored slot list. It is the player's own, and the first answer. */
  stored?: readonly ModernSlot[];
  /** The HUD layout this scheme wears, carried through untouched. */
  layoutId?: string;
}

/** The prefill this source would get if it had never been edited. */
const prefillFor = (source: SlotSource): ModernSlot[] => {
  if (source.keyboard) return keyboardModernBindings().slots;
  if (source.controls && source.controls.length > 0) return defaultSlotList(source.controls, source.core);
  return [];
};

/**
 * The slots this profile has right now, numbered 1..N.
 *
 * Renumbering on read is not a second source of truth: it is idempotent for a
 * list that is already contiguous, and it is the repair for one written by an
 * older build or hand-edited on disk. A gap in the numbering is not a state the
 * rest of the system has a meaning for.
 */
const effectiveSlots = (source: SlotSource): ModernSlot[] => {
  const stored = source.stored;
  if (stored && stored.length > 0) return renumberSlots(stored).slots;
  return prefillFor(source);
};

/** The modern lens for one profile: its core, and the slot list it carries. */
const effectiveModernBindings = (source: SlotSource): ModernBindings => ({
  core: source.core,
  slots: effectiveSlots(source),
  // Passed through, not defaulted: "this scheme names no layout" is a
  // real answer, and the shipped default is the HUD's business, not this
  // function's.
  ...(source.layoutId ? { layoutId: source.layoutId } : {}),
});

export { effectiveModernBindings, effectiveSlots };
export type { SlotSource };
