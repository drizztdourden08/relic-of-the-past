/* @layer renderer-components @kind logic */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { nextTitleSword, titleSwordLabel } from '@shared/game/title/title-swords';
import { Button, Field, SegmentedControl, Toggle } from '@drizztdourden08/tessera/primitives';
import { MOTION_OPTIONS, SCREEN_OPTIONS } from './hud-settings.constants';
import { isTitleDisabled } from './hud-title-disabled';

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

export { renderTitleControl };
