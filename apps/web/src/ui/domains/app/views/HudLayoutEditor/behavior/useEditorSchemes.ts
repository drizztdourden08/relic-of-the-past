/* @layer renderer-components @kind hook */
/**
 * THE SCHEME RUNNING RIGHT NOW. It is a quiet background fact, never a control a
 * player sets in this editor. A layout's own slot numbers are never validated
 * against a device (any number is legal, per the toolbar and outline), so this
 * hook exists only for the two things that still benefit from knowing what is
 * actually plugged in: sizing the preview's slot list realistically (a pad
 * layout previews with pad-shaped sample content, a keyboard layout with
 * keyboard-shaped), and writing the other half of the layout↔scheme join on
 * save, so "save a copy" still points at something that wears it.
 *
 * The list is read from the profile's own input profiles, through the SAME
 * migration door every other reader uses, so a pre-numbered slot list shows the
 * numbers it will actually have. Only schemes that have a modern block are
 * offered, because a classic profile has no slots to draw.
 */
import { useCallback, useEffect, useState } from 'react';
import { effectiveSlots, migrateSlotList } from '@shared/input/scheme';
import { DEFAULT_LAYOUT } from '@shared/hud/layouts';
import { readInputProfiles, writeInputProfiles } from '@app/lib/storage/profile-data-store';
import { activeProfileId } from '@app/lib/hud/active-profile';
import { getInputManager } from '@app/lib/input/input-manager';
import { liveSettingsNow } from '@app/lib/game/live-settings';
import { readConfig } from '@app/lib/storage/profile-store';
import { migrateProfilesLoudly } from '@app/lib/input/migrate-profiles';
import type { InputProfile, ModernBindings, ModernSlot } from '@shared/types/controls';

/** One control scheme, as this hook reads it. */
interface EditorScheme {
  id: string;
  name: string;
  deviceType: 'gamepad' | 'keyboard';
  /** The numbered list this scheme has right now. Used for preview sizing only. */
  slots: readonly ModernSlot[];
  /** The layout this scheme wears. Shown so a mismatch is visible. */
  layoutId: string;
}

interface EditorSchemes {
  selected: EditorScheme | null;
  /** Point one scheme at a layout, on disk and in the running session. */
  assignLayout: (schemeId: string, layoutId: string) => Promise<void>;
}

const useEditorSchemes = (): EditorSchemes => {
  const [schemes, setSchemes] = useState<readonly EditorScheme[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const profileId = await activeProfileId();
      if (!profileId || cancelled) return;
      const loaded = migrateProfilesLoudly(await readInputProfiles(profileId));
      const list = loaded.flatMap((profile): EditorScheme[] => {
        const modern = profile.modern;
        if (!modern) return [];
        return [{
          id: profile.id,
          name: profile.name,
          deviceType: profile.deviceType,
          slots: effectiveSlots({
            core: modern.core,
            keyboard: profile.deviceType === 'keyboard',
            stored: migrateSlotList(modern.slots).slots,
          }),
          layoutId: modern.layoutId ?? DEFAULT_LAYOUT.id,
        }];
      });
      if (cancelled) return;
      setSchemes(list);
      // The scheme in force is the one the player is most likely arranging for,
      // and it takes three tries because none of them is always right.
      //
      // The live settings first, when a profile has been loaded for play. Then
      // the profile's OWN RECORDED CHOICE, which is the answer that is always
      // there. It has to outrank the input manager, because the manager is
      // seeded with the keyboard preset at boot and would otherwise report a
      // device the player has not chosen. The manager is the last word only
      // when there is no stored choice at all.
      const stored = await readConfig(profileId);
      const storedActive = typeof stored?.activeInputProfileId === 'string'
        ? stored.activeInputProfileId
        : undefined;
      const active = liveSettingsNow()?.activeInputProfileId
        ?? storedActive
        ?? getInputManager().getProfile()?.id;
      setSelectedId(list.find((scheme) => scheme.id === active)?.id ?? list[0]?.id ?? null);
    })();
    return () => { cancelled = true; };
  }, []);

  /**
   * Write one change into a scheme's modern block, on disk and in the running
   * session. Re-pushing the active profile rebuilds the resolved bindings, and
   * both the HUD layout store and the control-scheme store are subscribed to
   * those, so a change here reaches the game in the same step.
   */
  const patchScheme = useCallback(async (
    schemeId: string,
    change: (modern: ModernBindings) => ModernBindings,
  ): Promise<InputProfile[] | null> => {
    const profileId = await activeProfileId();
    if (!profileId) return null;
    const loaded = migrateProfilesLoudly(await readInputProfiles(profileId));
    const next = loaded.map((profile) => (profile.id === schemeId && profile.modern
      ? { ...profile, modern: change(profile.modern), modifiedAt: Date.now() }
      : profile));
    await writeInputProfiles(profileId, next);
    const manager = getInputManager();
    manager.setProfiles(next);
    const active = next.find((profile) => profile.id === manager.getProfile()?.id);
    if (active) manager.setProfile(active);
    return next;
  }, []);

  const assignLayout = useCallback(async (schemeId: string, nextLayoutId: string) => {
    await patchScheme(schemeId, (modern) => ({ ...modern, layoutId: nextLayoutId }));
    setSchemes((list) => list.map((scheme) => (
      scheme.id === schemeId ? { ...scheme, layoutId: nextLayoutId } : scheme)));
  }, [patchScheme]);

  return {
    selected: schemes.find((scheme) => scheme.id === selectedId) ?? null,
    assignLayout,
  };
};

export { useEditorSchemes };
export type { EditorScheme, EditorSchemes };
