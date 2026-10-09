/* @layer tests @kind test */
import { describe, it, expect, beforeEach } from 'vitest';
import { resolveCurrentScreenDetailed } from '@rotp/game-data';
import { clearPalaceMismatches, getPalaceMismatches } from '@rotp/game-data';
import { describeDataset } from '../../dataset-guard';

const BASELINES = {
  'test-jail-cell': { isIndoors: true, palaceIndex: 0x02, roomIndex: 0x80, overworldScreenIndex: 0x00, whichEntrance: 0x04, screenId: 'screen-133' },
  'test-throne-room': { isIndoors: true, palaceIndex: 0x02, roomIndex: 0x51, overworldScreenIndex: 0x00, whichEntrance: 0x04, screenId: 'screen-119' },
  'test-sanctuary-grounds': { isIndoors: false, palaceIndex: 0xff, roomIndex: 0x12, overworldScreenIndex: 0x13, whichEntrance: 0x04, screenId: 'screen-061' },
} as const;

const resolve = (state: typeof BASELINES[keyof typeof BASELINES]) =>
  resolveCurrentScreenDetailed(state.isIndoors, state.palaceIndex, state.roomIndex, state.overworldScreenIndex, state.whichEntrance);

describeDataset('screen detection resolves the blessed nav baselines without the palace fallback', () => {
  beforeEach(() => {
    clearPalaceMismatches();
  });

  it('resolves the jail cell (room 0x80, palace 0x02) on the exact key', () => {
    const match = resolve(BASELINES['test-jail-cell']);
    expect(match?.screen.id).toBe('screen-133');
    expect(match?.method).toBe('exact');
    expect(match?.palaceMismatch).toBeUndefined();
  });

  it('resolves the throne room (room 0x51, palace 0x02) on the exact key', () => {
    const match = resolve(BASELINES['test-throne-room']);
    expect(match?.screen.id).toBe('screen-119');
    expect(match?.method).toBe('exact');
    expect(match?.palaceMismatch).toBeUndefined();
  });

  it('resolves the sanctuary grounds as an overworld screen', () => {
    const match = resolve(BASELINES['test-sanctuary-grounds']);
    expect(match?.screen.id).toBe('screen-061');
    expect(match?.method).toBe('overworld');
  });

  it('records no palace mismatch for any baseline state', () => {
    for (const state of Object.values(BASELINES)) resolve(state);
    expect([...getPalaceMismatches().values()]).toEqual([]);
  });
});

describeDataset('screen detection still catches a mislabelled room with the palace-scan fallback', () => {
  beforeEach(() => {
    clearPalaceMismatches();
  });

  it('resolves the room anyway and reports the mismatch', () => {
    const match = resolveCurrentScreenDetailed(true, 0x00, 0x80, 0x00);
    expect(match?.screen.id).toBe('screen-133');
    expect(match?.method).toBe('palace-scan');
    expect(match?.palaceMismatch).toEqual({ expected: 0x02, actual: 0x00 });
  });

  it('records the mismatch so a mislabel is observable, not silent', () => {
    resolveCurrentScreenDetailed(true, 0x00, 0x80, 0x00);
    expect([...getPalaceMismatches().values()]).toEqual([
      { expected: 0x02, actual: 0x00, room: 0x80, screenId: 'screen-133' },
    ]);
  });
});
