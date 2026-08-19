/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { resolveGates } from '../../shared/features/resolve-gates';
import { FEATURES, FEATURES_BY_ID } from '../../shared/features/feature-registry';

// The invariant Vanilla Safe exists to guarantee, kept alive as new features are added: no matter what
// was requested, turning Vanilla Safe on must leave nothing that diverges from stock cartridge behavior
// enabled. This is what "everything that touches the game code, no exemptions" means as a fact about the
// code rather than a sentence in a doc — feature #58 gets covered automatically because this test asks
// the registry, not a hand-maintained list.

describe('Vanilla Safe — resolveGates locks out every parity-affecting feature', () => {
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

  it('cascades through a multi-level requires chain — killing the root kills every descendant', () => {
    // extendedRendering → linearWorldTilemap → {ultrawideRendering, tallRendering}; both parents are
    // stripped directly (both affectsVanillaParity: true), but the fixpoint is what actually matters here:
    // it's what protects a FUTURE feature that depends on one of these without itself being parity-flagged.
    const requested = ['extendedRendering', 'linearWorldTilemap', 'ultrawideRendering', 'tallRendering'];
    const { effective } = resolveGates(requested, { vanillaSafe: true });
    expect(effective.size).toBe(0);
  });

  it('locks haptics like any other feature that touches vendored game code, but leaves developerToolsEnabled (purely host-side) untouched', () => {
    const { effective } = resolveGates(['haptics', 'developerToolsEnabled'], { vanillaSafe: true });
    expect(effective.has('haptics')).toBe(false);
    expect(effective.has('developerToolsEnabled')).toBe(true);
  });
});
