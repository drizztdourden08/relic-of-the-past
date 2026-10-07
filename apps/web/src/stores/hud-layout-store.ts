/* @layer renderer-stores @kind logic */
/**
 * The HUD layout in force right now. It is the document the enhanced HUD draws:
 * every region, every container, every element in it.
 *
 * THE ACTIVE CONTROL SCHEME CHOOSES IT. `ModernBindings.layoutId` names the
 * arrangement a scheme wears, and this store subscribes to the resolved
 * bindings (the same broadcast the control-scheme store listens to), so
 * switching the active control profile from the keyboard to a pad swaps the
 * slot list, the assignments and the HUD layout together, in one step. There is
 * no global HUD setting for it any more, because a layout that did not follow
 * the scheme could only ever be right for one of the player's devices.
 *
 * Two ways in, and they are not the same thing:
 *  - `setLayoutId` names a shipped layout and the store resolves it through the
 *    built-in registry, synchronously. It is the fallback path.
 *  - `setLayout` hands over a whole document, which is how the editor commits a
 *    custom one and how the scheme follower hands over a stored layout the
 *    registry has never heard of. `layoutId` follows the document it was given,
 *    so the two fields can never disagree about which layout is showing.
 *
 * An unknown id falls back to the shipped default instead of blanking the HUD:
 * a stale id in a profile is a much likelier cause than a real request for no
 * interface at all.
 */
import { create } from 'zustand';
import { DEFAULT_LAYOUT, layoutById } from '@shared/hud/layouts';
import { resolveStoredLayout } from '@app/lib/hud/layout-document-io';
import { onSchemeBindings } from '@app/lib/input/scheme-runtime';
import type { HudLayout } from '@shared/types/hud';
import type { ModernBindings } from '@shared/types/controls';

interface HudLayoutStore {
  /** The resolved active layout, built-in or custom. */
  layout: HudLayout;
  layoutId: string;
  setLayoutId: (id: string) => void;
  /** The editor commits through here. */
  setLayout: (layout: HudLayout) => void;
}

const resolveLayout = (id: string): HudLayout => layoutById(id) ?? DEFAULT_LAYOUT;

const useHudLayoutStore = create<HudLayoutStore>()((set) => ({
  layout: DEFAULT_LAYOUT,
  layoutId: DEFAULT_LAYOUT.id,
  setLayoutId: (id) => set({ layoutId: id, layout: resolveLayout(id) }),
  setLayout: (layout) => set({ layout, layoutId: layout.id }),
}));

/**
 * Follow the scheme.
 *
 * A scheme that names no layout reads as the shipped default, so an old profile
 * needs no migration to draw something. The read is asynchronous because a
 * custom layout lives in the profile's own file; a resolution that lands after
 * a further profile switch is discarded by comparing against the id still
 * wanted, so a fast switch cannot leave the previous device's HUD on screen.
 */
let wantedLayoutId = DEFAULT_LAYOUT.id;

const followSchemeLayout = (bindings: ModernBindings | null): void => {
  const id = bindings?.layoutId ?? DEFAULT_LAYOUT.id;
  if (id === useHudLayoutStore.getState().layoutId) return;
  wantedLayoutId = id;
  resolveStoredLayout(id)
    .then((layout) => { if (wantedLayoutId === id) useHudLayoutStore.getState().setLayout(layout); })
    .catch((e: unknown) => console.error('[hud] failed to resolve the scheme\'s HUD layout', e));
};

// Fires immediately with whatever the input engine resolved at boot, so a late
// import of this module still gets the layout the active scheme asked for.
onSchemeBindings(followSchemeLayout);

export { followSchemeLayout, useHudLayoutStore, resolveLayout };
export type { HudLayoutStore };
