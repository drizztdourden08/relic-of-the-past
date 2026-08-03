/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import * as saves from '@shared/storage/saves';
import { createMemFileStore } from './mem-file-store';

const bytes = (n: number, fill: number): Uint8Array => new Uint8Array(n).fill(fill);
const P = 'p1';

describe('saves store (over FileStore)', () => {
  it('writes/reads SRAM and rotates a backup', async () => {
    const f = createMemFileStore();
    await saves.writeSram(f, P, bytes(4, 1));
    expect(Array.from((await saves.readSram(f, P))!)).toEqual([1, 1, 1, 1]);
    await saves.writeSram(f, P, bytes(4, 2));
    expect(Array.from((await saves.readSram(f, P))!)).toEqual([2, 2, 2, 2]);
    expect(await f.readBytes(`profiles/${P}/saves/sram.bak`)).not.toBeNull();
  });

  it('writes quick states + screenshots and reports slot infos', async () => {
    const f = createMemFileStore();
    await saves.writeState(f, P, 0, bytes(8, 9));
    await saves.writeScreenshot(f, P, 0, bytes(3, 7));
    expect(await saves.listStates(f, P)).toEqual([0]);
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
