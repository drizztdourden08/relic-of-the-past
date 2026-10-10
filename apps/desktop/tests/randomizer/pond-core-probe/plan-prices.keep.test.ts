/* @layer tests @kind test */
import { expect, it } from 'vitest';
import { FEATURES3_POND_PLAN, WRAM } from './pond-core.constants';
import { describePondCore } from './describe-pond-core';
import { installPondRig } from './install-pond-rig';
import { pondGemSlot } from './pond-gem-slot';

describePondCore('pond seams in the built core (headless): prices and gems', () => {
  const { call, set8, get8, gate3, armPlan } = installPondRig();

  it('asks the plan price, takes it whole, and fills the bank exactly', () => {
    gate3(FEATURES3_POND_PLAN);
    armPlan();
    expect(call('WasmProbePondThrowIndex')).toBe(0);
    expect(call('WasmProbePondThrowCost', 50)).toBe(427);
    expect(call('WasmProbePondThrowAmount', 171)).toBe(427);
    expect(call('WasmProbePondPoolAdd', 427)).toBe(100);
    expect(call('WasmProbePondTossDelay', 80)).toBe(240);
  });

  it('shows the amount paid as the gems that add up to it', () => {
    gate3(FEATURES3_POND_PLAN);
    armPlan();
    expect([0, 1, 2, 3, 4, 5, 6].map((index) => call('WasmProbePondGemAt', 427, index)))
      .toEqual([0x46, 0x40, 0x36, 0x35, 0x34, 0x34, -1]);
    expect([0, 1].map((index) => call('WasmProbePondGemAt', 300, index))).toEqual([0x46, -1]);
    expect(call('WasmProbePondGemAt', 1, 0)).toBe(0x34);
    expect(call('WasmProbePondGemAt', 5, 0)).toBe(0x35);
    expect([0, 1, 2, 3].map((index) => call('WasmProbePondGemAt', 999, index))).toEqual([0x46, 0x46, 0x46, 0x41]);
  });

  it('a volley carries every colour it holds, not its first one three times', () => {
    gate3(FEATURES3_POND_PLAN);
    armPlan();
    expect(call('WasmProbePondSpawnVolley', 75, 0)).toBe(1);
    expect(get8(pondGemSlot(0))).toBe(0x41);
    expect(call('WasmProbePondSpawnVolley', 75, 1)).toBe(2);
    expect([0, 1].map((index) => get8(pondGemSlot(index)))).toEqual([0x36, 0x35]);
    expect(call('WasmProbePondSpawnVolley', 75, 2)).toBe(-1);
    expect(call('WasmProbePondSpawnVolley', 27, 0)).toBe(4);
    expect([0, 1, 2, 3].map((index) => get8(pondGemSlot(index)))).toEqual([0x36, 0x35, 0x34, 0x34]);
  });

  it('the vanilla cost prompt quotes the price the plan charges', () => {
    gate3(FEATURES3_POND_PLAN);
    call('WasmClearPondPlan');
    call('WasmSetPondThrow', 0, 75, 0, 0, -1, -1);
    call('WasmSetPondThrow', 1, 400, -1, 0, -1, -1);
    set8(WRAM.pondThrows, 0);
    const seventyFiveInBcd = 0x75;
    expect(call('WasmProbePondCostDigits', 0x50)).toBe(seventyFiveInBcd);
    set8(WRAM.pondThrows, 1);
    expect(call('WasmProbePondCostDigits', 0x50)).toBe(0x50);
    set8(WRAM.pondThrows, 2);
    expect(call('WasmProbePondCostDigits', 0x25)).toBe(0x25);
    gate3(0);
    set8(WRAM.pondThrows, 0);
    expect(call('WasmProbePondCostDigits', 0x25)).toBe(0x25);
  });
});
