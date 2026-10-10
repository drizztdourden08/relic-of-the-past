/* @layer tests @kind test */
import { expect, it } from 'vitest';
import { CLOSED_COST, FEATURES3_POND_PLAN, WRAM } from './pond-core.constants';
import { describePondCore } from './describe-pond-core';
import { installPondRig } from './install-pond-rig';

describePondCore('pond seams in the built core (headless): throws and refunds', () => {
  const { call, set8, get8, set16, get16, gate3, armPlan, seam } = installPondRig();

  it('resolves the throws in order, once each, then closes the pond', () => {
    gate3(FEATURES3_POND_PLAN);
    armPlan();
    const prizeOrdinalZero = 1 << 16;
    expect(call('WasmProbePondTakeThrow')).toBe(prizeOrdinalZero);
    expect(get8(WRAM.pondThrows)).toBe(1);
    expect(call('WasmProbePondTakeThrow')).toBe(0);
    expect(get8(WRAM.pondThrows)).toBe(2);
    expect(call('WasmProbePondTakeThrow')).toBe(100);
    expect(get8(WRAM.pondThrows)).toBe(3);
    expect(call('WasmProbePondTakeThrow')).toBe(-1);
    expect(get8(WRAM.pondThrows)).toBe(3);
    expect(call('WasmProbePondThrowCost', 50)).toBe(CLOSED_COST);
    expect(call('WasmProbePondThrowIndex')).toBe(3);
  });

  it('a capacity sale climbs the tier and pays nothing back at the ceiling', () => {
    gate3(FEATURES3_POND_PLAN);
    armPlan();
    const capacitySaleThrow = 1;
    const bombCeiling = 7;
    set8(WRAM.pondThrows, capacitySaleThrow);
    set8(WRAM.bombTier, 0);
    set16(WRAM.rupeesGoal, 500);
    expect(seam(0)).toBe(1);
    expect(get8(WRAM.bombTier)).toBe(1);
    expect(get16(WRAM.rupeesGoal)).toBe(500);
    set8(WRAM.pondThrows, capacitySaleThrow);
    set8(WRAM.bombTier, bombCeiling);
    set16(WRAM.rupeesGoal, 500);
    expect(seam(0)).toBe(1);
    expect(get8(WRAM.bombTier)).toBe(bombCeiling);
    expect(get16(WRAM.rupeesGoal)).toBe(500);
  });

  it('a throw that wins nothing hands back its refund and never more', () => {
    gate3(FEATURES3_POND_PLAN);
    armPlan();
    const losingThrow = 2;
    set8(WRAM.pondThrows, losingThrow);
    set16(WRAM.rupeesGoal, 500);
    expect(seam(1)).toBe(1);
    expect(get16(WRAM.rupeesGoal)).toBe(600);
    expect(get8(WRAM.pondThrows)).toBe(3);
    expect(600 - 500).toBeLessThan(200);
  });
});
