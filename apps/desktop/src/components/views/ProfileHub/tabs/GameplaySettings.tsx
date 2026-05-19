import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { SettingsLayout, type Section } from '../../../composites/SettingsLayout';
import { Toggle } from '../../../primitives/Toggle';
import { Slider } from '../../../primitives/Slider';

interface GameplaySettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const SECTIONS: Section[] = [
  {
    id: 'general',
    title: 'General',
    subsections: [
      {
        id: 'general-system',
        title: 'System',
        items: [
          { key: 'autosave', label: 'Autosave', description: 'Automatically save your progress when quitting and restore it on next launch', keywords: 'auto save restore quit' },
        ],
      },
      {
        id: 'general-savestates',
        title: 'Save States',
        items: [
          { key: 'enhancedSaveSlotShortcut', label: 'Enhanced Save Slot Shortcut', description: 'Opens the save slot menu on shortcut press instead of immediately saving/loading', keywords: 'save state slot shortcut enhanced menu overlay' },
          { key: 'saveHoldDuration', label: 'Hold to Save Duration', description: 'How long to hold the key to save (seconds)', keywords: 'save hold duration time seconds' },
        ],
      },
    ],
  },
  {
    id: 'items',
    title: 'Items',
    subsections: [
      {
        id: 'items-management',
        title: 'Item Management',
        items: [
          { key: 'itemSwitchLR', label: 'Advanced Item Selection', description: 'Use L and R shoulder buttons to cycle through your equipped items', keywords: 'item cycle lr bumper' },
          { key: 'itemSwitchLRLimit', label: 'Limit to First 4 Items', description: 'When cycling with L/R, only rotate through the first 4 item slots', keywords: 'item limit slots' },
        ],
      },
    ],
  },
  {
    id: 'movement',
    title: 'Movement',
    subsections: [
      {
        id: 'movement-options',
        title: 'Options',
        items: [
          { key: 'turnWhileDashing', label: 'Turn While Dashing', description: 'Change direction while using the Pegasus Boots dash', keywords: 'dash turn pegasus boots direction' },
          { key: 'mirrorToDarkworld', label: 'Mirror to Dark World', description: 'The Magic Mirror can warp you to the Dark World from the Light World', keywords: 'mirror warp dark world light world' },
          { key: 'cancelBirdTravel', label: 'Cancel Bird Travel', description: 'Cancel duck flight in progress by pressing the X button', keywords: 'bird duck cancel fly' },
        ],
      },
    ],
  },
  {
    id: 'combat',
    title: 'Combat',
    subsections: [
      {
        id: 'combat-options',
        title: 'Options',
        items: [
          { key: 'collectItemsWithSword', label: 'Collect Items with Sword', description: 'Pick up hearts, rupees, and other items by slashing them with your sword', keywords: 'sword collect slash hearts items' },
          { key: 'breakPotsWithSword', label: 'Break Pots with Sword', description: 'Level 2 or higher swords can break pots by slashing them', keywords: 'pots sword break level' },
          { key: 'moreActiveBombs', label: 'More Active Bombs', description: 'Place up to 4 active bombs at once instead of the original limit of 2', keywords: 'bombs active limit' },
        ],
      },
    ],
  },
  {
    id: 'qol',
    title: 'Quality of Life',
    subsections: [
      {
        id: 'qol-options',
        title: 'Options',
        items: [
          { key: 'disableLowHealthBeep', label: 'Disable Low Heart Beep', description: 'Silence the repeating warning beep when your health is low', keywords: 'beep heart health warning annoying' },
          { key: 'skipIntroOnKeypress', label: 'Skip Intro on Keypress', description: 'Press any key to skip the intro and title screen sequence', keywords: 'intro skip key press' },
          { key: 'showMaxItemsInYellow', label: 'Indicate Max Resources', description: 'Highlight rupees, bombs, and arrows in yellow when you\'re carrying the maximum amount', keywords: 'max yellow rupees bombs arrows' },
          { key: 'carryMoreRupees', label: 'Larger Wallet', description: 'Increase the maximum rupee capacity from 999 to 9999', keywords: 'rupees wallet money' },
        ],
      },
    ],
  },
  {
    id: 'bugfixes',
    title: 'Bug Fixes',
    subsections: [
      {
        id: 'bugfixes-options',
        title: 'Options',
        items: [
          { key: 'miscBugFixes', label: 'Miscellaneous Minor Fixes', description: 'Apply various minor corrections for original game glitches — fixes follower behavior, music transitions, death counting, and tile rendering issues', keywords: 'bug fix glitch minor misc', link: 'https://github.com/snesrev/zelda3/wiki/Bug-Fixes-:-Misc.' },
          { key: 'gameChangingBugFixes', label: 'Game-Changing Bug Fixes', description: 'Apply fixes that noticeably affect gameplay behavior — changes enemy patterns, chest drops, and boss mechanics to match intended design', keywords: 'bug fix game changing major', link: 'https://github.com/snesrev/zelda3/wiki/Bug-Fixes-:-Game-Changing' },
        ],
      },
    ],
  },
];

function isDisabled(key: string, settings: GameSettings): boolean {
  if (key === 'itemSwitchLRLimit') return !settings.itemSwitchLR;
  if (key === 'saveHoldDuration') return !settings.enhancedSaveSlotShortcut;
  return false;
}

function renderControl(key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null {
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
}

const GameplaySettings = (props: GameplaySettingsProps) => {
  const { settings, onChange } = props;
  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      onChange={onChange}
      renderControl={renderControl}
      isDisabled={isDisabled}
    />
  );
}

export { GameplaySettings };
