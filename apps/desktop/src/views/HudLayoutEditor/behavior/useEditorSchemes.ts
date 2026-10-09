/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import { effectiveSlots, migrateSlotList } from '@rotp/input-mapping';
import { DEFAULT_LAYOUT } from '@rotp/hud';
import { readInputProfiles, writeInputProfiles } from '@app/storage/profile-data-store';
import { activeProfileId } from '@app/hud/active-profile';
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import { liveSettingsNow } from '@app/game/live-settings';
import { readConfig } from '@app/storage/profile-store';
import { migrateProfilesLoudly } from '@rotp/input-mapping';
import type { InputProfile } from '@rotp/input-mapping';
import type { ModernBindings } from '@rotp/game-data';
import type { EditorScheme, EditorSchemes } from './useEditorSchemes.type';

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
export type { EditorScheme, EditorSchemes } from './useEditorSchemes.type';
