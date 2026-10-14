/* @layer renderer-components @kind logic */
import { liveSettingsNow } from '@app/game/live-settings';
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import { readConfig } from '@app/storage/profile-store';
import type { EditorScheme } from './editor-schemes.type';

const storedActiveOf = async (profileId: string): Promise<string | undefined> => {
  const stored = await readConfig(profileId);
  return typeof stored?.activeInputProfileId === 'string' ? stored.activeInputProfileId : undefined;
};

const pickActiveScheme = async (profileId: string, list: readonly EditorScheme[]): Promise<string | null> => {
  const storedActive = await storedActiveOf(profileId);
  const active = liveSettingsNow()?.activeInputProfileId
    ?? storedActive
    ?? getInputManager().getProfile()?.id;
  return list.find((scheme) => scheme.id === active)?.id ?? list[0]?.id ?? null;
};

export { pickActiveScheme };
