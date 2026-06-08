/* @layer renderer-components @kind component */
/** Per-key control renderer + disabled rules for the Gameplay settings tab. */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { Toggle } from '../../../../../design-system/primitives/Toggle';
import { Slider } from '../../../../../design-system/primitives/Slider';

const isDisabled = (key: string, settings: GameSettings): boolean => {
  if (key === 'itemSwitchLRLimit') return !settings.itemSwitchLR;
  if (key === 'saveHoldDuration') return !settings.enhancedSaveSlotShortcut;
  if (key === 'autoSaveIntervalSeconds') return !settings.autoSaveEnabled;
  if (key === 'autoSaveMaxEntries') return !settings.autoSaveEnabled;
  return false;
};

const renderControl = (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null => {
  if (key === 'autoSaveEnabled') {
    return (
      <Toggle
        label="Enable Auto-Save"
        description="Automatically create save state snapshots at regular intervals during gameplay"
        checked={settings.autoSaveEnabled}
        onChange={(v) => onChange({ autoSaveEnabled: v })}
      />
    );
  }
  if (key === 'autoSaveIntervalSeconds') {
    return (
      <Slider
        label="Auto-Save Interval"
        description="How often to create an automatic save"
        value={settings.autoSaveIntervalSeconds}
        min={60}
        max={1800}
        step={60}
        formatValue={(v) => v >= 60 ? `${Math.floor(v / 60)}m` : `${v}s`}
        onChange={(v) => onChange({ autoSaveIntervalSeconds: v })}
        disabled={!settings.autoSaveEnabled}
      />
    );
  }
  if (key === 'autoSaveMaxEntries') {
    return (
      <Slider
        label="Max Auto-Save Entries"
        description="Maximum number of auto-saves to keep (oldest are pruned)"
        value={settings.autoSaveMaxEntries}
        min={1}
        max={20}
        step={1}
        formatValue={(v) => `${v}`}
        onChange={(v) => onChange({ autoSaveMaxEntries: v })}
        disabled={!settings.autoSaveEnabled}
      />
    );
  }
  if (key === 'saveOnQuit') {
    return (
      <Toggle
        label="Save on Quit"
        description="Automatically create a save state when you stop the game or close the app"
        checked={settings.saveOnQuit}
        onChange={(v) => onChange({ saveOnQuit: v })}
      />
    );
  }
  if (key === 'enhancedSaveSlotShortcut') {
    return (
      <Toggle
        label="Enhanced Save Slot Shortcut"
        description="Opens the save slot menu on shortcut press instead of immediately saving/loading"
        checked={settings.enhancedSaveSlotShortcut}
        onChange={(v) => onChange({ enhancedSaveSlotShortcut: v })}
      />
    );
  }
  if (key === 'saveHoldDuration') {
    return (
      <Slider
        label="Hold to Save Duration"
        description="How long to hold the key to save (seconds)"
        value={settings.saveHoldDuration}
        min={1}
        max={5}
        step={0.5}
        formatValue={(v) => `${v}s`}
        onChange={(v) => onChange({ saveHoldDuration: v })}
        disabled={!settings.enhancedSaveSlotShortcut}
      />
    );
  }
  return null;
};

export { renderControl, isDisabled };
