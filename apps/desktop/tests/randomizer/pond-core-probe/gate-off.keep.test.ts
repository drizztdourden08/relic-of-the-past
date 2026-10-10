/* @layer tests @kind test */
import { expect, it } from 'vitest';
import { FEATURES3_POND_PLAN, WRAM } from './pond-core.constants';
import { describePondCore } from './describe-pond-core';
import { installPondRig } from './install-pond-rig';

describePondCore('pond seams in the built core (headless): gate off and empty plan', () => {
  const { call, set8, get8, set16, get16, gate3, armPlan, seam } = installPondRig();

  it('gate off: every seam hands back the vendored expression and touches nothing', () => {
    gate3(FEATURES3_POND_PLAN);
    armPlan();
    gate3(0);
    expect(call('WasmProbePondThrowIndex')).toBe(-1);
    expect(call('WasmProbePondThrowCost', 50)).toBe(50);
    expect(call('WasmProbePondThrowAmount', 171)).toBe(171);
    expect(call('WasmProbePondPoolAdd', 427)).toBe(427);
    expect(call('WasmProbePondTossDelay', 80)).toBe(80);
    expect(call('WasmProbePondLaterMessage', 0x14c)).toBe(0x14c);
    expect(call('WasmProbePondCostDigits', 0x25)).toBe(0x25);
    expect(call('WasmProbePondAwardMessage')).toBe(-1);
    set8(WRAM.immobilized, 0);
    expect(call('WasmProbePondHoldPlayer')).toBe(0);
    expect(call('WasmProbePondTakeThrow')).toBe(-1);
    set8(WRAM.pondThrows, 0);
    set8(WRAM.arrowTier, 3);
    set16(WRAM.rupeesGoal, 500);
    expect(seam(1)).toBe(0);
    expect(get8(WRAM.pondThrows)).toBe(0);
    expect(get8(WRAM.arrowTier)).toBe(3);
    expect(get16(WRAM.rupeesGoal)).toBe(500);
  });

  it('an empty plan under the gate leaves the pond native', () => {
    gate3(FEATURES3_POND_PLAN);
    call('WasmClearPondPlan');
    expect(call('WasmProbePondThrowIndex')).toBe(-1);
    expect(call('WasmProbePondThrowCost', 25)).toBe(25);
    expect(call('WasmProbePondPoolAdd', 25)).toBe(25);
  });
});
