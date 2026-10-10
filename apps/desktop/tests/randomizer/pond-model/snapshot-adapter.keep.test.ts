/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { baselineValues, parsePondSetting, pondValuesOf, pondPlanOf, DEFAULT_POND_SETTING, LEGACY_POND_SETTING } from '@rotp/randomizer';
import type { PondSetting } from '@rotp/randomizer';
import { CUSTOM } from './pond-model.constants';

describe('pond snapshot adapter', () => {
  it('reads a snapshot with no pond row as the baseline pond', () => {
    const values = { ...baselineValues };
    delete (values as Record<string, unknown>)['pond_capacity_mode'];
    expect(parsePondSetting(values).setting).toEqual(DEFAULT_POND_SETTING);
  });

  it('the shipped baseline is the fresh-profile pond', () => {
    expect(parsePondSetting(baselineValues).setting).toEqual(DEFAULT_POND_SETTING);
  });

  it('round-trips every mode', () => {
    for (const setting of [LEGACY_POND_SETTING, { mode: 'vanilla-cost', items: 5 }, CUSTOM] as PondSetting[]) {
      expect(parsePondSetting(pondValuesOf(setting)).setting).toEqual(setting);
    }
  });

  it('a mode the model no longer offers reads as the legacy pond, with a note', () => {
    const parsed = parsePondSetting({ ...pondValuesOf(CUSTOM), pond_capacity_mode: 'gamble' });
    expect(parsed.setting).toEqual(LEGACY_POND_SETTING);
    expect(parsed.notes).toContain('Hylia Fairy: unknown mode gamble, using the vanilla pond');
  });

  it('reports every fallback it applies', () => {
    const parsed = parsePondSetting({
      ...pondValuesOf(CUSTOM), pond_capacity_ask_rupees_min: 300, pond_capacity_ask_rupees_max: 100,
    });
    expect(parsed.notes.length).toBeGreaterThan(0);
    expect(parsed.setting).toMatchObject({ mode: 'custom', start: 300, max: 300 });
  });
});

describe('pond held to the wallet', () => {
  const walletTo = (top: string) => ({
    capacity_wallet_mode: 'custom', capacity_wallet_start: '0', capacity_wallet_max: top, capacity_wallet_count: 1,
  });

  it('pulls a custom range down to the highest price the wallet holds', () => {
    const parsed = parsePondSetting({ ...pondValuesOf({ ...CUSTOM, start: 200, max: 999 }), ...walletTo('599') });
    expect(parsed.setting).toMatchObject({ mode: 'custom', start: 200, max: 500 });
    expect(parsed.notes)
      .toContain('Hylia Fairy: the wallet tops out at 599, so the price range is held at 500');
    const start = parsePondSetting({ ...pondValuesOf({ ...CUSTOM, start: 900, max: 999 }), ...walletTo('599') });
    expect(start.setting).toMatchObject({ mode: 'custom', start: 500, max: 500 });
  });

  it('leaves the fixed schedule alone: the wallet floor puts every top above it', () => {
    const vanilla = parsePondSetting({ ...pondValuesOf({ mode: 'vanilla-cost', items: 2 }), ...walletTo('599') });
    expect(vanilla.setting).toEqual({ mode: 'vanilla-cost', items: 2 });
    expect(vanilla.notes).toEqual([]);
    expect(pondPlanOf(vanilla.setting).totalPrice).toBe(1400);
  });

  it('leaves every setting untouched under a wallet that reaches its prices', () => {
    for (const setting of [{ mode: 'vanilla-cost', items: 5 }, { ...CUSTOM, max: 999 }] as PondSetting[]) {
      expect(parsePondSetting({ ...pondValuesOf(setting), ...walletTo('999') }).setting).toEqual(setting);
    }
    expect(parsePondSetting({ ...pondValuesOf({ mode: 'vanilla-cost', items: 5 }), ...walletTo('299') }).setting)
      .toEqual({ mode: 'vanilla-cost', items: 5 });
  });
});
