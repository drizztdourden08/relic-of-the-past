/* @layer renderer-components @kind hook */
/**
 * The HUD layout THIS control scheme wears, and the list of layouts to choose
 * from.
 *
 * It lives on the input profile beside the slot list instead of in a global
 * HUD setting, because it is a property of the scheme: switching the active
 * control profile from the keyboard to a pad swaps the slot list, the
 * assignments and the HUD arrangement together, in one step. The key-cap HUD
 * becomes the pad HUD without the player opening the HUD settings at all.
 *
 * TWO SCHEMES MAY NAME THE SAME LAYOUT, and that is not a bug: editing it edits
 * it for both, and "save a copy" in the editor is how one of them forks. The id
 * is the only join, exactly as the slot NUMBER is the only join on the other
 * half of this screen.
 *
 * A profile that names nothing reads as the shipped default, so nothing on disk
 * needs migrating to gain a layout.
 */
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_LAYOUT } from '@shared/hud/layouts';
import { listLayouts } from '@app/lib/hud/layout-document-io';
import type { HudLayout } from '@shared/types/hud';
import type { InputProfile } from '@shared/types/controls';

interface UseSchemeLayoutArgs {
  activeProfile: InputProfile | null;
  updateActiveProfile: (profile: InputProfile) => void;
}

interface SchemeLayout {
  /** The id this scheme names, or the shipped default when it names none. */
  layoutId: string;
  /** Every layout the picker offers: shipped first, then the player's own. */
  layouts: readonly HudLayout[];
  setLayoutId: (id: string) => void;
}

const useSchemeLayout = (args: UseSchemeLayoutArgs): SchemeLayout => {
  const { activeProfile, updateActiveProfile } = args;
  const [layouts, setLayouts] = useState<readonly HudLayout[]>([]);

  useEffect(() => {
    let cancelled = false;
    void listLayouts().then((all) => { if (!cancelled) setLayouts(all); });
    return () => { cancelled = true; };
  }, []);

  const layoutId = activeProfile?.modern?.layoutId ?? DEFAULT_LAYOUT.id;

  /**
   * Written to the PROFILE, so it travels with the control profile: pick the
   * pad up again and the pad's HUD comes back with it. The live HUD follows on
   * its own, because the layout store is subscribed to the resolved bindings.
   *
   * A profile with no modern block yet is left alone instead of given half a
   * one: the scheme is built in `build-modern-bindings`, and seeding a layout
   * without a slot list would be a scheme that draws nothing.
   */
  const setLayoutId = useCallback((next: string) => {
    const modern = activeProfile?.modern;
    if (!activeProfile || !modern) return;
    updateActiveProfile({ ...activeProfile, modern: { ...modern, layoutId: next }, modifiedAt: Date.now() });
  }, [activeProfile, updateActiveProfile]);

  return { layoutId, layouts, setLayoutId };
};

export { useSchemeLayout };
export type { SchemeLayout, UseSchemeLayoutArgs };
