/* @layer tests @kind test */
/**
 * Headless core probe for the progressive tier masks. The built wasm is loaded
 * in node the way the capacity probe loads it, a family's mask is armed the way
 * a session arms it (WasmSetProgressiveTiers), and the family's virtual id is
 * resolved through the grant resolver exactly as a seam would. Pinned: a copy
 * hands over the LOWEST rung still present at or above the tier already held,
 * so unticking a middle rung shortens the ladder rather than leaving a hole;
 * an unarmed family walks the full ladder, which is the arithmetic the core had
 * before the masks existed.
 *
 * Skips when the wasm, the asset blob or the vault fixture is absent.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const ROOT = resolve(__dirname, '../..');
const WASM_JS = resolve(ROOT, 'apps/web/public/wasm/zelda3.js');
const FIXTURE = resolve(ROOT, 'tests/fixtures/save-states/test-links-house.sav');

const FEATURES0_DEVELOPER_TOOLS = 1073741824;
const FEATURES3_RECEIPT_EXPORT = 32768;

/** progressive_grants.c: 0x62 blade, 0x66 bow. */
const ID = { sword: 0x62, bow: 0x66 };
/** progressive_grants.c kFamilies order. */
const FAMILY = { sword: 0, bow: 4 };
const SWORD_TIER_ID = [0x49, 0x01, 0x02, 0x03];
const BOW_TIER_ID = [0x0b, 0x3b];
/** The twenty-rupee replacement handed out past the top rung. */
const CAP_ITEM = 0x36;

const WRAM = { swordType: 0xf359, itemBow: 0xf340 };

const assetBlobPath = (): string | undefined => {
  if (process.env.ROTP_ASSETS_DAT !== undefined && existsSync(process.env.ROTP_ASSETS_DAT)) {
    return process.env.ROTP_ASSETS_DAT;
  }
  const dirs = [
    resolve(ROOT, '.user-data/Data/assets'),
    join(process.env.APPDATA ?? '', 'relic-of-the-past/Data/assets'),
  ];
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

describeCore('progressive tier masks in the built core (headless)', () => {
  let core: Core;
  let ram = 0;

  const call = (name: string, ...args: number[]): number =>
    core.ccall(name, 'number', args.map(() => 'number'), args);
  const set8 = (addr: number, value: number): void => { core.HEAPU8[ram + addr] = value; };
  const frames = (n: number): void => {
    for (let i = 0; i < n; i += 1) expect(call('WasmDevRunFrame', 0)).toBe(1);
  };

  /** The id a copy of |virtualId| would hand over with the family standing on |tier|. */
  const grantAt = (virtualId: number, addr: number, raw: number): number => {
    set8(addr, raw);
    return call('WasmProbeResolveGrant', virtualId);
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
    call('WasmSetGateWord', 3, FEATURES3_RECEIPT_EXPORT);
    frames(2);
  }, 120_000);

  it('unarmed: every rung is there, so a copy hands over the next tier as it always did', () => {
    call('WasmClearProgressiveTiers');
    for (let tier = 0; tier < SWORD_TIER_ID.length; tier += 1) {
      expect(grantAt(ID.sword, WRAM.swordType, tier), `tier ${tier}`).toBe(SWORD_TIER_ID[tier]);
    }
    expect(grantAt(ID.sword, WRAM.swordType, 4)).toBe(CAP_ITEM);
  });

  it('every rung ticked reads exactly like unarmed', () => {
    call('WasmSetProgressiveTiers', FAMILY.sword, 0b1111);
    for (let tier = 0; tier < SWORD_TIER_ID.length; tier += 1) {
      expect(grantAt(ID.sword, WRAM.swordType, tier), `tier ${tier}`).toBe(SWORD_TIER_ID[tier]);
    }
  });

  it('an unticked middle rung shortens the ladder rather than leaving a hole in it', () => {
    // Rungs 0, 2, 3 present: the second copy skips straight past the missing one.
    call('WasmSetProgressiveTiers', FAMILY.sword, 0b1101);
    expect(grantAt(ID.sword, WRAM.swordType, 0)).toBe(SWORD_TIER_ID[0]);
    expect(grantAt(ID.sword, WRAM.swordType, 1)).toBe(SWORD_TIER_ID[2]);
    expect(grantAt(ID.sword, WRAM.swordType, 3)).toBe(SWORD_TIER_ID[3]);
    expect(grantAt(ID.sword, WRAM.swordType, 4)).toBe(CAP_ITEM);
  });

  it('only the first rung ticked: one copy, then rupees', () => {
    call('WasmSetProgressiveTiers', FAMILY.sword, 0b0001);
    expect(grantAt(ID.sword, WRAM.swordType, 0)).toBe(SWORD_TIER_ID[0]);
    expect(grantAt(ID.sword, WRAM.swordType, 1)).toBe(CAP_ITEM);
  });

  it('an empty mask is the DISARMED spelling, not "no rungs"', () => {
    // A family with nothing ticked puts no copy in the pool at all, so the core is never
    // asked to resolve one; zero therefore means "never armed" and gives the whole ladder
    // back, which is what keeps a session that says nothing byte-identical.
    call('WasmSetProgressiveTiers', FAMILY.sword, 0);
    expect(grantAt(ID.sword, WRAM.swordType, 0)).toBe(SWORD_TIER_ID[0]);
    expect(grantAt(ID.sword, WRAM.swordType, 1)).toBe(SWORD_TIER_ID[1]);
  });

  it('the bow reads its half-scale tier through the mask too', () => {
    call('WasmSetProgressiveTiers', FAMILY.bow, 0b10);
    // link_item_bow 0: no bow held, so the first copy hands over the top rung directly.
    expect(grantAt(ID.bow, WRAM.itemBow, 0)).toBe(BOW_TIER_ID[1]);
    // The byte carries the arrow state in its low bit, so 3 is that same top rung held:
    // nothing is left above it and a second copy is surplus.
    expect(grantAt(ID.bow, WRAM.itemBow, 3)).toBe(CAP_ITEM);
    call('WasmClearProgressiveTiers');
    expect(grantAt(ID.bow, WRAM.itemBow, 0)).toBe(BOW_TIER_ID[0]);
  });
});
