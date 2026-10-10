/* @layer tests @kind test */
import { expect, it } from 'vitest';
import { FEATURES3_POND_PLAN, WRAM } from './pond-core.constants';
import { describePondCore } from './describe-pond-core';
import { installPondRig } from './install-pond-rig';

describePondCore('pond seams in the built core (headless): lines and the player', () => {
  const { call, set8, gate3, armPlan } = installPondRig();

  it('the award line says whether the water still holds a prize', () => {
    gate3(FEATURES3_POND_PLAN);
    call('WasmClearPondPlan');
    call('WasmSetPondThrow', 0, 100, 0, 0, -1, -1);
    call('WasmSetPondThrow', 1, 100, 1, 0, -1, -1);
    call('WasmSetPondThrow', 2, 100, -1, 0, -1, -1);
    call('WasmSetPondAwardMessage', 470, 471);
    set8(WRAM.pondThrows, 0);
    expect(call('WasmProbePondAwardMessage')).toBe(470);
    set8(WRAM.pondThrows, 1);
    expect(call('WasmProbePondAwardMessage')).toBe(471);
    set8(WRAM.pondThrows, 2);
    expect(call('WasmProbePondAwardMessage')).toBe(-1);
    call('WasmSetPondAwardMessage', -1, -1);
    set8(WRAM.pondThrows, 0);
    expect(call('WasmProbePondAwardMessage')).toBe(-1);
  });

  it('holds the player still through the palette fade the purchase ends with', () => {
    gate3(FEATURES3_POND_PLAN);
    armPlan();
    set8(WRAM.immobilized, 0);
    expect(call('WasmProbePondHoldPlayer')).toBe(1);
    set8(WRAM.pondThrows, 3);
    set8(WRAM.immobilized, 0);
    expect(call('WasmProbePondHoldPlayer')).toBe(1);
  });

  it('speaks its own lines only where one was composed', () => {
    gate3(FEATURES3_POND_PLAN);
    armPlan();
    call('WasmSetPondThrow', 2, 200, -1, 100, 461, 462);
    call('WasmSetPondClosedMessage', 463);
    expect(call('WasmProbePondConsolationMessage')).toBe(-1);
    set8(WRAM.pondThrows, 2);
    expect(call('WasmProbePondConsolationMessage')).toBe(462);
    const notEnoughRupeesYet = 0x14c;
    expect(call('WasmProbePondLaterMessage', notEnoughRupeesYet)).toBe(notEnoughRupeesYet);
    set8(WRAM.pondThrows, 3);
    expect(call('WasmProbePondConsolationMessage')).toBe(-3);
    expect(call('WasmProbePondLaterMessage', notEnoughRupeesYet)).toBe(463);
    call('WasmSetPondClosedMessage', -1);
    expect(call('WasmProbePondLaterMessage', notEnoughRupeesYet)).toBe(notEnoughRupeesYet);
  });
});
