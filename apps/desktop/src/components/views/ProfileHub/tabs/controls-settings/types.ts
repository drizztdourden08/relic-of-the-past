/**
 * Types & utilities for controls-settings sub-hooks.
 */

import type { GameSettings } from '@shared/types/settings';
import type { InputProfile } from '@shared/types/controls';

interface UseControlsSettingsArgs {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  profileId: string;
}

/** Pad a hex VID/PID to 4 chars lowercase, e.g. "57e" → "057e" */
function padHex(v: string): string {
  return v.toLowerCase().padStart(4, '0');
}

export type { UseControlsSettingsArgs };
export { padHex };
