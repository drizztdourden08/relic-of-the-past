/* @layer renderer-components @kind component */
import type { ReactNode } from 'react';
import type { GameSettings, HapticSettings } from '@shared/types/settings';
import { SettingsLayout } from '../../../compounds/SettingsLayout';
import { openVanillaSafeSettings } from '@app/stores/search-store';
import { Toggle } from '../../../../../design-system/primitives/Toggle';
import { Slider } from '../../../../../design-system/primitives/Slider';
import { SECTIONS } from './haptics-settings-sections';

interface HapticsSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
}

const isDisabled = (key: string, settings: GameSettings): boolean => {
  if (key === 'haptics.enabled') return false;
  // All other haptic settings are disabled when haptics is off
  return !settings.haptics?.enabled;
};

const hapticPatch = (settings: GameSettings, field: keyof HapticSettings, value: boolean | number): Partial<GameSettings> => {
  return {
    haptics: {
      ...settings.haptics,
      [field]: value,
    },
  };
};

const renderControl = (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void): ReactNode | null => {
  const haptics = settings.haptics;
  if (!haptics) return null;

  const disabled = isDisabled(key, settings);

  switch (key) {
    case 'haptics.enabled':
      return (
        <Toggle
          label="Enable Haptic Feedback"
          description="Enable controller vibration/rumble for game events"
          checked={haptics.enabled}
          onChange={(v) => onChange(hapticPatch(settings, 'enabled', v))}
        />
      );

    case 'haptics.intensity':
      return (
        <Slider
          label="Vibration Intensity"
          description="Global intensity multiplier for all haptic feedback"
          value={haptics.intensity}
          min={10}
          max={100}
          step={5}
          formatValue={(v) => `${v}%`}
          onChange={(v) => onChange(hapticPatch(settings, 'intensity', v))}
          disabled={disabled}
        />
      );

    case 'haptics.swordSwing':
      return (
        <Toggle
          label="Sword Swing"
          description="Very faint vibration when the player swings the sword"
          checked={haptics.swordSwing}
          onChange={(v) => onChange(hapticPatch(settings, 'swordSwing', v))}
          disabled={disabled}
        />
      );

    case 'haptics.swordHitEnemy':
      return (
        <Toggle
          label="Sword Hit Enemy"
          description="Normal vibration when the sword connects with an enemy"
          checked={haptics.swordHitEnemy}
          onChange={(v) => onChange(hapticPatch(settings, 'swordHitEnemy', v))}
          disabled={disabled}
        />
      );

    case 'haptics.swordClink':
      return (
        <Toggle
          label="Sword Clink"
          description="Faint vibration when the sword clinks against a surface"
          checked={haptics.swordClink}
          onChange={(v) => onChange(hapticPatch(settings, 'swordClink', v))}
          disabled={disabled}
        />
      );

    case 'haptics.damageTaken':
      return (
        <Toggle
          label="Damage Taken"
          description="Vibration scaled to damage amount when the player gets hurt"
          checked={haptics.damageTaken}
          onChange={(v) => onChange(hapticPatch(settings, 'damageTaken', v))}
          disabled={disabled}
        />
      );

    case 'haptics.itemUse':
      return (
        <Toggle
          label="Item Use"
          description="Vibration when using items (hammer, hookshot, bombs, medallions, rods)"
          checked={haptics.itemUse}
          onChange={(v) => onChange(hapticPatch(settings, 'itemUse', v))}
          disabled={disabled}
        />
      );

    case 'haptics.dashVibration':
      return (
        <Toggle
          label="Dash Vibration"
          description="Rhythmic step vibration while running with the Pegasus Boots"
          checked={haptics.dashVibration}
          onChange={(v) => onChange(hapticPatch(settings, 'dashVibration', v))}
          disabled={disabled}
        />
      );

    case 'haptics.environmentalEffects':
      return (
        <Toggle
          label="Environmental Effects"
          description="Vibration for world events: falls, ledges, water, mirror, chests, explosions"
          checked={haptics.environmentalEffects}
          onChange={(v) => onChange(hapticPatch(settings, 'environmentalEffects', v))}
          disabled={disabled}
        />
      );

    default:
      return null;
  }
};

const HapticsSettings = (props: HapticsSettingsProps) => {
  const { settings, onChange } = props;
  return (
    <SettingsLayout
      sections={SECTIONS}
      settings={settings}
      onChange={onChange}
      renderControl={renderControl}
      isDisabled={isDisabled}
      onOpenVanillaSafeSettings={openVanillaSafeSettings}
    />
  );
};

export { HapticsSettings };
