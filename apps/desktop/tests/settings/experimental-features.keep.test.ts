/* @layer renderer-components @kind test */
import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, mergeSettings } from '@rotp/game-core';
import { experimentalFeaturesEnabled } from '@rotp/features';
import { transformSettingsPatch } from '@app/settings-effects/transform-settings-patch';
import { buildRandomizerConfig, freshRandomizerForm } from '@app/views/DataManager/sub-components/profile-manager/build-randomizer-config';
import type { AppSettings } from '@app/settings.type';

const settings = (part: Partial<AppSettings> = {}): AppSettings => ({
  ...DEFAULT_SETTINGS,
  ...part,
});

describe('experimental feature gate', () => {
  it('requires Developer Mode and the Experimental Features toggle', () => {
    expect(experimentalFeaturesEnabled(settings({ experimentalFeaturesEnabled: true }))).toBe(false);
    expect(experimentalFeaturesEnabled(settings({ developerToolsEnabled: true }))).toBe(false);
    expect(experimentalFeaturesEnabled(settings({ developerToolsEnabled: true, experimentalFeaturesEnabled: true }))).toBe(true);
  });

  it('turns unfinished game settings off when the toggle is switched off', () => {
    const current = settings({ developerToolsEnabled: true, experimentalFeaturesEnabled: true, hudStyle: 'modern', extraDungeon: true });
    expect(transformSettingsPatch({ experimentalFeaturesEnabled: false }, current)).toMatchObject({
      experimentalFeaturesEnabled: false,
      hudStyle: 'enhanced',
      extraDungeon: false,
    });
  });

  it('normalises old profile settings and rejects a direct Modern HUD patch', () => {
    const old = mergeSettings({ developerToolsEnabled: false, experimentalFeaturesEnabled: true, hudStyle: 'modern', extraDungeon: true });
    expect(old).toMatchObject({ experimentalFeaturesEnabled: false, hudStyle: 'enhanced', extraDungeon: false });
    expect(transformSettingsPatch({ hudStyle: 'modern', extraDungeon: true }, settings())).toMatchObject({
      hudStyle: 'enhanced',
      extraDungeon: false,
    });
  });

  it('keeps new randomizer profiles local while Experimental Features is off', () => {
    const form = { ...freshRandomizerForm(), enabled: true, mode: 'online' as const, seed: 'my-seed' };
    expect(buildRandomizerConfig(form, false)?.mode).toBe('local');
  });
});
