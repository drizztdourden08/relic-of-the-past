/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { resolveGates } from '@rotp/features';
import { FEATURES, FEATURES_BY_ID } from '@rotp/features';

describe('Vanilla Safe makes resolveGates lock out every parity-affecting feature', () => {
  it('requesting every registered feature id with vanillaSafe leaves none of them parity-affecting', () => {
    const allFeatureIds = FEATURES.map((f) => f.id);
    const { effective } = resolveGates(allFeatureIds, { vanillaSafe: true });

    const stillAffectsParity = [...effective].filter((id) => FEATURES_BY_ID[id]?.affectsVanillaParity);
    expect(stillAffectsParity).toEqual([]);
  });

  it('does not touch the effective set when vanillaSafe is off (the fixpoint still applies)', () => {
    const { effective } = resolveGates(['extendedRendering', 'cameraLockToViewport'], { vanillaSafe: false });
    expect(effective.has('extendedRendering')).toBe(true);
    expect(effective.has('cameraLockToViewport')).toBe(true);
  });

  it('cascades through a multi-level requires chain, so killing the root kills every descendant', () => {
    const requested = ['extendedRendering', 'linearWorldTilemap', 'ultrawideRendering', 'tallRendering'];
    const { effective } = resolveGates(requested, { vanillaSafe: true });
    expect(effective.size).toBe(0);
  });

  it('locks every feature with a call site in vendored game code, observational or not', () => {
    const { effective } = resolveGates(['haptics', 'developerToolsEnabled'], { vanillaSafe: true });
    expect(effective.has('haptics')).toBe(false);
    expect(effective.has('developerToolsEnabled')).toBe(false);
  });
});
