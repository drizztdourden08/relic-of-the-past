/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import { saves } from '@rotp/game-core';
import { createSaveStore } from '../../apps/desktop/node_modules/@drizztdourden08/brock-port-kit/src/index';
import { createMemFileStore } from './mem-file-store';

const bytes = (n: number, fill: number): Uint8Array => new Uint8Array(n).fill(fill);
const P = 'p1';

describe('saves store (over FileStore)', () => {
  it('keeps SRAM at the profile path and rotates a backup', async () => {
    const f = createMemFileStore();
    const { sram } = createSaveStore(f);
    await sram.write(P, bytes(4, 1));
    await sram.write(P, bytes(4, 2));
    expect(Array.from((await f.readBytes(`profiles/${P}/saves/sram.dat`))!)).toEqual([2, 2, 2, 2]);
    expect(Array.from((await f.readBytes(`profiles/${P}/saves/sram.bak`))!)).toEqual([1, 1, 1, 1]);
  });

  it('reports quick slots the port kit store wrote', async () => {
    const f = createMemFileStore();
    const { slots } = createSaveStore(f);
    await slots.write(P, { kind: 'quick', slot: 0 }, { bytes: bytes(8, 9), screenshot: bytes(3, 7) });
    expect(await f.exists(`profiles/${P}/saves/quick/save0.sav`)).toBe(true);
    const infos = await saves.getSlotInfos(f, P);
    expect(infos).toHaveLength(1);
    expect(infos[0]).toMatchObject({ slot: 0, size: 8, hasScreenshot: true });
  });

  it('normal saves: create / list / rename / delete', async () => {
    const f = createMemFileStore();
    const a = await saves.createNormalSave(f, P, 'A', bytes(10, 1));
    expect((await saves.listNormalSaves(f, P)).map((s) => s.id)).toEqual([a.id]);
    await saves.renameNormalSave(f, P, a.id, 'A2');
    expect((await saves.listNormalSaves(f, P))[0].name).toBe('A2');
    await saves.deleteNormalSave(f, P, a.id);
    expect(await saves.listNormalSaves(f, P)).toHaveLength(0);
  });

  it('prunes auto saves to the newest N', async () => {
    const f = createMemFileStore();
    const dir = `profiles/${P}/saves/auto`;
    const entries = Array.from({ length: 7 }, (_, i) => ({ id: String(i + 1), timestamp: i + 1, trigger: 'timer' as const }));
    for (const e of entries) await f.writeBytes(`${dir}/${e.id}.sav`, bytes(2, 0));
    await f.writeText(`${dir}/manifest.json`, JSON.stringify(entries));
    await saves.pruneAutoSaves(f, P, 5);
    expect(await saves.listAutoSaves(f, P)).toHaveLength(5);
  });
});
