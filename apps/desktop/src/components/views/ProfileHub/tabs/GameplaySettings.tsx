import type { GameSettings } from '@shared/types/settings';
import { Toggle } from '../../../primitives/Toggle';
import { SettingsSection } from '../../../composites/SettingsSection';

interface GameplaySettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

export function GameplaySettings({ settings, onChange }: GameplaySettingsProps) {
  return (
    <div className="settings-tab">
      <SettingsSection title="General">
        <Toggle
          label="Autosave"
          description="Auto-save state on quit, restore on start"
          checked={settings.autosave}
          onChange={(v) => onChange({ autosave: v })}
        />
        <Toggle
          label="Show FPS in Title"
          description="Display performance info in window title"
          checked={settings.displayPerfInTitle}
          onChange={(v) => onChange({ displayPerfInTitle: v })}
        />
        <Toggle
          label="Disable Frame Delay"
          description="Skip SDL_Delay each frame (best at 60Hz)"
          checked={settings.disableFrameDelay}
          onChange={(v) => onChange({ disableFrameDelay: v })}
        />
      </SettingsSection>

      <SettingsSection title="Item Management">
        <Toggle
          label="Advanced Item Selection"
          description="L/R buttons cycle through items"
          checked={settings.itemSwitchLR}
          onChange={(v) => onChange({ itemSwitchLR: v })}
        />
        <Toggle
          label="Limit to First 4 Items"
          description="Only cycle through first 4 item slots"
          checked={settings.itemSwitchLRLimit}
          onChange={(v) => onChange({ itemSwitchLRLimit: v })}
          disabled={!settings.itemSwitchLR}
        />
      </SettingsSection>

      <SettingsSection title="Movement">
        <Toggle
          label="Turn While Dashing"
          description="Change direction while Pegasus Boots dash"
          checked={settings.turnWhileDashing}
          onChange={(v) => onChange({ turnWhileDashing: v })}
        />
        <Toggle
          label="Mirror to Dark World"
          description="Mirror can warp to Dark World from Light World"
          checked={settings.mirrorToDarkworld}
          onChange={(v) => onChange({ mirrorToDarkworld: v })}
        />
        <Toggle
          label="Cancel Bird Travel"
          description="Cancel duck flight with X button"
          checked={settings.cancelBirdTravel}
          onChange={(v) => onChange({ cancelBirdTravel: v })}
        />
      </SettingsSection>

      <SettingsSection title="Combat">
        <Toggle
          label="Collect Items with Sword"
          description="Collect hearts and items by slashing them"
          checked={settings.collectItemsWithSword}
          onChange={(v) => onChange({ collectItemsWithSword: v })}
        />
        <Toggle
          label="Break Pots with Sword"
          description="Level 2+ sword can break pots"
          checked={settings.breakPotsWithSword}
          onChange={(v) => onChange({ breakPotsWithSword: v })}
        />
        <Toggle
          label="More Active Bombs"
          description="Up to 4 active bombs instead of 2"
          checked={settings.moreActiveBombs}
          onChange={(v) => onChange({ moreActiveBombs: v })}
        />
      </SettingsSection>

      <SettingsSection title="Quality of Life">
        <Toggle
          label="Disable Low Heart Beep"
          description="Silence the low health warning sound"
          checked={settings.disableLowHealthBeep}
          onChange={(v) => onChange({ disableLowHealthBeep: v })}
        />
        <Toggle
          label="Skip Intro on Keypress"
          description="Skip the intro sequence with any key"
          checked={settings.skipIntroOnKeypress}
          onChange={(v) => onChange({ skipIntroOnKeypress: v })}
        />
        <Toggle
          label="Indicate Max Resources"
          description="Show max rupees/bombs/arrows in yellow"
          checked={settings.showMaxItemsInYellow}
          onChange={(v) => onChange({ showMaxItemsInYellow: v })}
        />
        <Toggle
          label="Larger Wallet"
          description="Carry 9999 rupees instead of 999"
          checked={settings.carryMoreRupees}
          onChange={(v) => onChange({ carryMoreRupees: v })}
        />
      </SettingsSection>

      <SettingsSection title="Bug Fixes">
        <Toggle
          label="Miscellaneous Minor Fixes"
          description="Various minor glitch corrections"
          checked={settings.miscBugFixes}
          onChange={(v) => onChange({ miscBugFixes: v })}
        />
        <Toggle
          label="Game-Changing Bug Fixes"
          description="Fixes that affect gameplay behavior"
          checked={settings.gameChangingBugFixes}
          onChange={(v) => onChange({ gameChangingBugFixes: v })}
        />
      </SettingsSection>
    </div>
  );
}
