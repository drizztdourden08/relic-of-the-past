/* @layer renderer-components @kind component */
/** Control renderer + disabled rules for the Title Screen section of the HUD settings tab. */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { nextTitleSword, titleSwordLabel } from '@shared/game/title/title-swords';
import { Button } from '../../../../../design-system/primitives/Button';
import { Field } from '../../../../../design-system/primitives/Field';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import { Toggle } from '../../../../../design-system/primitives/Toggle';

const SCREEN_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'reimagined', label: 'Reimagined' },
];

const MOTION_OPTIONS = [
  { value: 'still', label: 'Still' },
  { value: 'drifting', label: 'Drifting' },
];

const TITLE_KEYS = new Set(['titleScreen', 'titleMotion', 'titleFollowsProgress', 'titleSword']);

/** Every row but the switch describes the reimagined title, so the original one idles them. */
const isTitleDisabled = (key: string, settings: GameSettings): boolean =>
  key !== 'titleScreen' && TITLE_KEYS.has(key) && settings.titleScreen === 'original';

const renderTitleControl = (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null => {
  const disabled = isTitleDisabled(key, settings);
  switch (key) {
    case 'titleScreen':
      return (
        <SegmentedControl
          label="Title Screen"
          description="Original keeps the game's title. Reimagined draws a wider scene over the same sequence."
          value={settings.titleScreen}
          options={SCREEN_OPTIONS}
          onChange={(v) => onChange({ titleScreen: v as GameSettings['titleScreen'] })}
        />
      );
    case 'titleMotion':
      return (
        <SegmentedControl
          label="Motion"
          description="Drifting moves the scene and the clouds slowly while the title waits."
          value={settings.titleMotion}
          options={MOTION_OPTIONS}
          disabled={disabled}
          onChange={(v) => onChange({ titleMotion: v as GameSettings['titleMotion'] })}
        />
      );
    case 'titleSword':
      return (
        <Field label="Sword" hint="The sword planted in the title. Progress picks it from the most advanced save. Press to step to the next one.">
          <Button variant="secondary" size="sm" disabled={disabled} onClick={() => onChange({ titleSword: nextTitleSword(settings.titleSword) })}>
            {titleSwordLabel(settings.titleSword)}
          </Button>
        </Field>
      );
    case 'titleFollowsProgress':
      return (
        <Toggle
          label="Follows Progress"
          description="The world, and the sword set to Progress, come from the most advanced save."
          checked={settings.titleFollowsProgress}
          disabled={disabled}
          onChange={(v) => onChange({ titleFollowsProgress: v })}
        />
      );
    default:
      return null;
  }
};

export { isTitleDisabled, renderTitleControl };
