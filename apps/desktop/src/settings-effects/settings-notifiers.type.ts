/* @layer renderer-components @kind types */
import type { GameSettings } from '@rotp/features';
import type { SettingsEffectDeps } from './settings-effects.type';

interface SettingsNotifier {
  keys: readonly (keyof GameSettings)[];
  run: (next: GameSettings, deps: SettingsEffectDeps) => void;
}

export type { SettingsNotifier };
