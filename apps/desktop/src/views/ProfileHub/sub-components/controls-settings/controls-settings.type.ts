/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { GameSettings } from '@rotp/features';

type SettingsChange = (patch: Partial<GameSettings>) => void;

interface UseControlsArgs {
  settings: GameSettings;
  onChange: SettingsChange;
}

interface UseProfileStoreArgs extends UseControlsArgs {
  profileId: string;
}

interface LatestSettings {
  settings: GameSettings;
  onChange: SettingsChange;
}

interface CreateProfileStoreArgs {
  profileId: string;
  latest: RefObject<LatestSettings>;
}

export type { CreateProfileStoreArgs,SettingsChange, UseControlsArgs, UseProfileStoreArgs };
