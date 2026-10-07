/* @layer renderer-components @kind hook */
/**
 * The slot list the preview is drawn for, made reachable from a field.
 *
 * A SLOT NUMBER IS NEVER VALIDATED AGAINST A DEVICE. That rule is unchanged
 * and this does not soften it. What the scheme gives is a PREVIEW: slot 3 of
 * the scheme in force is bound to a control with a glyph, so the field that
 * asks for a slot number can show what that number currently draws instead of
 * repeating, in prose, that the number is not checked. A number past the list
 * is still perfectly legal; it previews as empty, with a note (§40).
 *
 * CARRIED AS CONTEXT, for the reason `formula-scope.ts` gives for its own. The
 * scheme is a fact about the EDITOR SESSION, not about the selected node, so
 * threading it down through `NodeInspector` → `ContentSection` → each editor
 * would widen four prop shapes for information three leaves use. The provider
 * sits where the sample state is already in hand.
 *
 * DEFAULT IS AN EMPTY LIST, and an empty list means "nothing is previewed", not
 * "no slots exist". Every consumer draws the number it was given either
 * way, which is what makes a test fixture and the SSR measurement harness
 * render the real control instead of a degraded one.
 */
import { createContext, useContext } from 'react';
import type { ModernSlot } from '@shared/types/controls';

const SlotSchemeContext = createContext<readonly ModernSlot[]>([]);

const useSlotScheme = (): readonly ModernSlot[] => useContext(SlotSchemeContext);

/** The glyph position slot N draws with, or `undefined` when the previewed
 *  scheme does not reach that number (or declares no position for it). */
const slotPositionOf = (slots: readonly ModernSlot[], index: number): string | undefined =>
  slots.find((slot) => slot.index === index)?.position;

/** Whether the previewed scheme has this number at all. That is the ONLY thing the
 *  out-of-range note claims, and it claims it about the preview, not the HUD. */
const slotInScheme = (slots: readonly ModernSlot[], index: number): boolean =>
  slots.some((slot) => slot.index === index);

export { slotInScheme, SlotSchemeContext, slotPositionOf, useSlotScheme };
