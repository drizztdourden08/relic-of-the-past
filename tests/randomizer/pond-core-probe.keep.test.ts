/* @layer tests @kind test */
/**
 * Headless core probe for the rupee pond's seams: the built wasm is loaded in
 * node with the user's asset blob, a save-state fixture puts the game in a
 * room, and the seams are exercised with the pond gate ON and then OFF:
 *   the price, the amount taken, what the bank receives and how long the
 *   purchase waits are the plan's values with the gate on and the vendored
 *   expression's own values with it off;
 *   the throws resolve in order and the save counter climbs once per throw, so
 *   a prize is handed over exactly once and an exhausted pond names a price no
 *   wallet holds;
 *   a purchase that sells a capacity level climbs the tier, and at the ceiling
 *   it hands back NOTHING, since the vanilla hundred-rupee refund would make a
 *   cheap pond a money press;
 *   a throw that wins nothing hands back exactly its refund, which is below its
 *   price, so it cannot be farmed either;
 *   the gems a throw shows are the decomposition of the amount paid, and one
 *   volley carries every denomination sharing its decoded sheet, each under its
 *   own receipt, so the gems in the air add up to the price;
 *   the vanilla cost prompt, where it still runs, quotes the plan's price and
 *   not the two native amounts, up to the two digits that line can hold;
 *   the award line of a prize throw says whether the water still holds one;
 *   the purchase holds the player still through the palette fade it ends with,
 *   which the receipt ceremony a prize rides would otherwise let them walk out
 *   of, stranding the room's colours in the player's own palette row;
 *   the plan's own lines replace the vanilla wording only where one was
 *   composed, and only an EXHAUSTED pond takes the closing line, so a wallet too
 *   light for the current price keeps the vanilla come-back-later refusal.
 * Skips when the wasm, the asset blob or the vault fixture is absent, so a
 * clone without them has to stay green.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { SRM_POND_THROWS } from '@app/lib/game/save-file/hook-save-bytes';

const ROOT = resolve(__dirname, '../..');
const WASM_JS = resolve(ROOT, 'apps/web/public/wasm/zelda3.js');
const FIXTURE = resolve(ROOT, 'tests/fixtures/save-states/test-links-house.sav');

const FEATURES0_DEVELOPER_TOOLS = 1073741824;
const FEATURES3_POND_PLAN = 67108864;

/**
 * Addresses of the bytes the probe stages and reads back: variables.h for the vanilla
 * ones, the hook-owned registry (core/game-hooks/save_bytes.h) for the rest.
 */
const WRAM = {
  module: 0x10, submodule: 0x11, rupeesGoal: 0xf360, bombTier: 0xf370, arrowTier: 0xf371,
  pondThrows: SRM_POND_THROWS,
  /** The pond's ten flying-gem slots: the receipt each one draws under (variables.h). */
  pondGemReceipt: 0x1587a,
  immobilized: 0x2e4,
};

/** The pond fills its slots from the top down, so gem |index| of a volley lands here. */
const POND_GEM_SLOT = (index: number): number => WRAM.pondGemReceipt + 9 - index;

/** The price an exhausted pond names: above any wallet, so the handler closes it. */
const CLOSED_COST = 0x7fff;

const assetBlobPath = (): string | undefined => {
  if (process.env.ROTP_ASSETS_DAT !== undefined && existsSync(process.env.ROTP_ASSETS_DAT)) return process.env.ROTP_ASSETS_DAT;
  const dirs = [resolve(ROOT, '.user-data/Data/assets'), join(process.env.APPDATA ?? '', 'relic-of-the-past/Data/assets')];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    const dat = readdirSync(dir).find((name) => name.endsWith('.dat'));
    if (dat !== undefined) return join(dir, dat);
  }
  return undefined;
};

const blob = assetBlobPath();
const ready = existsSync(WASM_JS) && existsSync(FIXTURE) && blob !== undefined;
const describeCore = ready ? describe : describe.skip;

interface Core {
  ccall: (name: string, ret: 'number' | null, types: string[], args: number[]) => number;
  HEAPU8: Uint8Array;
  FS: { mkdir: (path: string) => void; writeFile: (path: string, data: Uint8Array) => void };
}

describeCore('pond seams in the built core (headless)', () => {
  let core: Core;
  let ram = 0;

  const call = (name: string, ...args: number[]): number =>
    core.ccall(name, 'number', args.map(() => 'number'), args);
  const set8 = (addr: number, value: number): void => { core.HEAPU8[ram + addr] = value; };
  const get8 = (addr: number): number => core.HEAPU8[ram + addr];
  const set16 = (addr: number, value: number): void => { set8(addr, value & 0xff); set8(addr + 1, value >> 8); };
  const get16 = (addr: number): number => get8(addr) | (get8(addr + 1) << 8);
  const frames = (n: number): void => { for (let i = 0; i < n; i += 1) expect(call('WasmDevRunFrame', 0)).toBe(1); };
  const gate3 = (word: number): void => { call('WasmSetGateWord', 3, word); frames(2); };

  /**
   * The three-throw plan every case below reads: a prize, a capacity sale, a throw
   * that wins nothing. Every host line is left unarmed (-1), so the seams that show a message
   * show the vanilla one and stay inside the baked dialogue blob; the line seams are
   * pinned on their own, through the read-only probes.
   */
  const armPlan = (): void => {
    call('WasmClearPondPlan');
    call('WasmSetPondThrow', 0, 427, 0, 0, -1, -1);
    call('WasmSetPondThrow', 1, 300, -1, 0, -1, -1);
    call('WasmSetPondThrow', 2, 200, -1, 100, -1, -1);
    set8(WRAM.pondThrows, 0);
  };

  /** Run the purchase seam, restoring the module bytes its message moves. */
  const seam = (kind: number): number => {
    const module = get8(WRAM.module);
    const submodule = get8(WRAM.submodule);
    const owned = call('WasmProbePondSeam', kind);
    set8(WRAM.module, module);
    set8(WRAM.submodule, submodule);
    return owned;
  };

  beforeAll(async () => {
    const factory = createRequire(import.meta.url)(WASM_JS) as (opts: object) => Promise<Core>;
    core = await factory({ noInitialRun: true, print: () => undefined, printErr: () => undefined });
    core.FS.writeFile('/zelda3_assets.dat', readFileSync(blob!));
    core.FS.mkdir('/saves');
    core.FS.writeFile('/saves/save0.sav', readFileSync(FIXTURE));
    call('WasmInitHeadless');
    call('WasmSetGateWord', 0, FEATURES0_DEVELOPER_TOOLS);
    frames(2);
    ram = call('WasmProbeWramPtr');
    expect(ram).toBeGreaterThan(0);
    call('WasmLoadState', 0);
    frames(2);
  }, 120_000);

  it('asks the plan price, takes it whole, and fills the bank exactly', () => {
    gate3(FEATURES3_POND_PLAN);
    armPlan();
    expect(call('WasmProbePondThrowIndex')).toBe(0);
    expect(call('WasmProbePondThrowCost', 50)).toBe(427);
    expect(call('WasmProbePondThrowAmount', 171)).toBe(427);
    expect(call('WasmProbePondPoolAdd', 427)).toBe(100);
    // 427 = 1 gold + 1 silver + (1 red + 1 blue + 2 green): three decoded sheets.
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
    // 75 = 1 violet + 1 red + 1 blue. The violet needs its own decoded sheet, so it leaves
    // alone; the red and the blue share one and leave TOGETHER, each under its own receipt.
    expect(call('WasmProbePondSpawnVolley', 75, 0)).toBe(1);
    expect(get8(POND_GEM_SLOT(0))).toBe(0x41);
    expect(call('WasmProbePondSpawnVolley', 75, 1)).toBe(2);
    expect([0, 1].map((index) => get8(POND_GEM_SLOT(index)))).toEqual([0x36, 0x35]);
    expect(call('WasmProbePondSpawnVolley', 75, 2)).toBe(-1);
    // 27 = 1 red + 1 blue + 2 green: all four in one volley, all four in their own colour.
    expect(call('WasmProbePondSpawnVolley', 27, 0)).toBe(4);
    expect([0, 1, 2, 3].map((index) => get8(POND_GEM_SLOT(index)))).toEqual([0x36, 0x35, 0x34, 0x34]);
  });

  it('the vanilla cost prompt quotes the price the plan charges', () => {
    gate3(FEATURES3_POND_PLAN);
    call('WasmClearPondPlan');
    call('WasmSetPondThrow', 0, 75, 0, 0, -1, -1);
    call('WasmSetPondThrow', 1, 400, -1, 0, -1, -1);
    set8(WRAM.pondThrows, 0);
    // 0x75 is 75 in the BCD the line's [Number] commands read, not the native 0x50.
    expect(call('WasmProbePondCostDigits', 0x50)).toBe(0x75);
    // Two digits is all the baked line has, so a price past 99 leaves them as vanilla wrote
    // them and the plan's own composed prompt is what states it.
    set8(WRAM.pondThrows, 1);
    expect(call('WasmProbePondCostDigits', 0x50)).toBe(0x50);
    // Exhausted, and with the gate down, the vendored digits stand untouched.
    set8(WRAM.pondThrows, 2);
    expect(call('WasmProbePondCostDigits', 0x25)).toBe(0x25);
    gate3(0);
    set8(WRAM.pondThrows, 0);
    expect(call('WasmProbePondCostDigits', 0x25)).toBe(0x25);
  });

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
    // A throw that sells a capacity level keeps the vanilla question: the choice is real.
    set8(WRAM.pondThrows, 2);
    expect(call('WasmProbePondAwardMessage')).toBe(-1);
    // Nothing composed: the vanilla question stands for every throw.
    call('WasmSetPondAwardMessage', -1, -1);
    set8(WRAM.pondThrows, 0);
    expect(call('WasmProbePondAwardMessage')).toBe(-1);
  });

  it('holds the player still through the palette fade the purchase ends with', () => {
    gate3(FEATURES3_POND_PLAN);
    armPlan();
    // The prize goes out through the receipt ceremony, whose cleanup frees the player, and
    // the fade that follows is undone by the purchase's own last state alone. Walking out
    // of it leaves the room's colours in the player's palette row for good.
    set8(WRAM.immobilized, 0);
    expect(call('WasmProbePondHoldPlayer')).toBe(1);
    // An exhausted pond has no purchase to wrap up, but a plan still owns the pond.
    set8(WRAM.pondThrows, 3);
    set8(WRAM.immobilized, 0);
    expect(call('WasmProbePondHoldPlayer')).toBe(1);
  });

  it('resolves the throws in order, once each, then closes the pond', () => {
    gate3(FEATURES3_POND_PLAN);
    armPlan();
    // Throw 0 hands over prize ordinal 0 and no consolation.
    expect(call('WasmProbePondTakeThrow')).toBe(1 << 16);
    expect(get8(WRAM.pondThrows)).toBe(1);
    // Throw 1 sells a capacity level: no prize, no consolation.
    expect(call('WasmProbePondTakeThrow')).toBe(0);
    expect(get8(WRAM.pondThrows)).toBe(2);
    // Throw 2 wins nothing: no prize, a hundred back out of two hundred.
    expect(call('WasmProbePondTakeThrow')).toBe(100);
    expect(get8(WRAM.pondThrows)).toBe(3);
    // Nothing left: the counter stops climbing and the price closes the pond.
    expect(call('WasmProbePondTakeThrow')).toBe(-1);
    expect(get8(WRAM.pondThrows)).toBe(3);
    expect(call('WasmProbePondThrowCost', 50)).toBe(CLOSED_COST);
    expect(call('WasmProbePondThrowIndex')).toBe(3);
  });

  it('a capacity sale climbs the tier and pays nothing back at the ceiling', () => {
    gate3(FEATURES3_POND_PLAN);
    armPlan();
    set8(WRAM.pondThrows, 1);   // throw 1: the capacity sale
    set8(WRAM.bombTier, 0);
    set16(WRAM.rupeesGoal, 500);
    expect(seam(0)).toBe(1);
    expect(get8(WRAM.bombTier)).toBe(1);
    expect(get16(WRAM.rupeesGoal)).toBe(500);
    // At the ceiling the same sale hands back nothing, so the vanilla branch
    // refunds a hundred here, which a cheap pond could farm.
    set8(WRAM.pondThrows, 1);
    set8(WRAM.bombTier, 7);
    set16(WRAM.rupeesGoal, 500);
    expect(seam(0)).toBe(1);
    expect(get8(WRAM.bombTier)).toBe(7);
    expect(get16(WRAM.rupeesGoal)).toBe(500);
  });

  it('a throw that wins nothing hands back its refund and never more', () => {
    gate3(FEATURES3_POND_PLAN);
    armPlan();
    set8(WRAM.pondThrows, 2);   // throw 2: 200 rupees, 100 back
    set16(WRAM.rupeesGoal, 500);
    expect(seam(1)).toBe(1);
    expect(get16(WRAM.rupeesGoal)).toBe(600);
    expect(get8(WRAM.pondThrows)).toBe(3);
    // The refund is strictly below the price, so a throw always costs money.
    expect(600 - 500).toBeLessThan(200);
  });

  it('speaks its own lines only where one was composed', () => {
    gate3(FEATURES3_POND_PLAN);
    armPlan();
    // A losing throw carries its own consolation, because the vanilla line promises a
    // flat hundred back and this one hands back half of what it took.
    call('WasmSetPondThrow', 2, 200, -1, 100, 461, 462);
    call('WasmSetPondClosedMessage', 463);
    expect(call('WasmProbePondConsolationMessage')).toBe(-1);
    set8(WRAM.pondThrows, 2);
    expect(call('WasmProbePondConsolationMessage')).toBe(462);
    // While a throw is still on the table the refusal is the vanilla "not enough
    // rupees yet" line; only an exhausted pond says it has nothing left.
    expect(call('WasmProbePondLaterMessage', 0x14c)).toBe(0x14c);
    set8(WRAM.pondThrows, 3);
    expect(call('WasmProbePondConsolationMessage')).toBe(-3);
    expect(call('WasmProbePondLaterMessage', 0x14c)).toBe(463);
    // No composed line: the vanilla wording stands and the plan still runs.
    call('WasmSetPondClosedMessage', -1);
    expect(call('WasmProbePondLaterMessage', 0x14c)).toBe(0x14c);
  });

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
