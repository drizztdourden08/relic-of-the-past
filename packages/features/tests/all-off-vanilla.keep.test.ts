/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { GameSettings } from '@rotp/features';
import { BUNDLE_FIXES } from '@rotp/features';
import { buildFeatureFlags, buildFeatureWords, buildPpuFlags } from '@rotp/game-core';

const allOff = {
  aspectRatio: '4:3',
  hudStyle: 'vanilla',
  extendedRendering: false,
  widescreenSprites: true,
  widescreenVisualFixes: true,
  turnWhileDashing: false,
  mirrorToDarkworld: false,
  collectItemsWithSword: false,
  breakPotsWithSword: false,
  disableLowHealthBeep: false,
  skipIntroOnKeypress: false,
  showMaxItemsInYellow: false,
  moreActiveBombs: false,
  carryMoreRupees: false,
  miscBugFixes: false,
  gameChangingBugFixes: false,
  cancelBirdTravel: false,
  dimFlashes: false,
  disableTelepathy: false,
  cameraLockToViewport: false,
  perGroupVolume: false,
  musicVolume: 100,
  sfxVolume: 100,
  musicMuted: false,
  sfxMuted: false,
  haptics: { enabled: false },
} as unknown as GameSettings;

describe('all-off == vanilla (bridge boundary)', () => {
  it('sends zero feature words with everything off at 4:3', () => {
    expect(buildFeatureFlags(allOff)).toBe(0);
    const { features1, features2 } = buildFeatureWords(allOff);
    expect(features1).toBe(0);
    expect(features2).toBe(0);
  });

  it('does not request the 240-line render budget unless extended rendering is on', () => {
    const HEIGHT240 = 4;
    expect(buildPpuFlags({ ...allOff, extendY: true, extendedRendering: false } as GameSettings) & HEIGHT240).toBe(0);
    expect(buildPpuFlags({ ...allOff, extendY: true, extendedRendering: true } as GameSettings) & HEIGHT240).toBe(HEIGHT240);
  });

  it('the legacy miscBugFixes master enables exactly the MiscBugFixes-origin fixes', () => {
    const { features1, features2 } = buildFeatureWords({ ...allOff, miscBugFixes: true } as GameSettings);
    let e1 = 0;
    let e2 = 0;
    for (const f of BUNDLE_FIXES) {
      if (f.bundleOrigin !== 'MiscBugFixes' || !f.bit) continue;
      if (f.word === 2) e2 |= f.bit;
      else e1 |= f.bit;
    }
    expect(features1).toBe(e1);
    expect(features2).toBe(e2);
  });

  it('a granular toggle overrides its legacy master (off-by-default override)', () => {
    const first = BUNDLE_FIXES.find((f) => f.bundleOrigin === 'MiscBugFixes' && f.word === 1)!;
    const s = { ...allOff, miscBugFixes: true, bugFixToggles: { [first.id]: false } } as GameSettings;
    const { features1 } = buildFeatureWords(s);
    expect(features1 & first.bit!).toBe(0);
  });
});
