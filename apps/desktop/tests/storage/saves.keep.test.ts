/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import { createSaveStore } from '@drizztdourden08/brock-port-kit';
import { autoSaves, normalSaves, quickSlotInfos } from '@app/storage/save-files';
import { createMemFileStore } from './mem-file-store';
import { required } from '../required';

const bytes = (n: number, fill: number): Uint8Array => new Uint8Array(n).fill(fill);
const P = 'p1';

describe('saves store (over FileStore)', () => {
  it('keeps SRAM at the profile path and rotates a backup', async () => {
    const f = createMemFileStore();
    const { sram } = createSaveStore(f);
    await sram.write(P, bytes(4, 1));
    await sram.write(P, bytes(4, 2));
    const sramBytes = await f.readBytes(`profiles/${P}/saves/sram.dat`);
    const backupBytes = await f.readBytes(`profiles/${P}/saves/sram.bak`);
    expect(sramBytes).not.toBeNull();
    expect(backupBytes).not.toBeNull();
    expect(Array.from(sramBytes ?? [])).toEqual([2, 2, 2, 2]);
    expect(Array.from(backupBytes ?? [])).toEqual([1, 1, 1, 1]);
  });

  it('reports quick slots the port kit store wrote', async () => {
    const f = createMemFileStore();
    const { slots } = createSaveStore(f);
    await slots.write(P, { kind: 'quick', slot: 0 }, { bytes: bytes(8, 9), screenshot: bytes(3, 7) });
    expect(await f.exists(`profiles/${P}/saves/quick/save0.sav`)).toBe(true);
    const infos = await quickSlotInfos(f, P);
    expect(infos).toHaveLength(1);
    expect(infos[0]).toMatchObject({ slot: 0, size: 8, hasScreenshot: true });
  });

  it('normal saves: create / list / rename / delete', async () => {
    const f = createMemFileStore();
    const a = await normalSaves.create(f, P, 'A', { data: bytes(10, 1) });
    expect((await normalSaves.list(f, P)).map((s) => s.id)).toEqual([a.id]);
    await normalSaves.rename(f, P, a.id, 'A2');
    expect(required((await normalSaves.list(f, P))[0], 'the renamed save').name).toBe('A2');
    await normalSaves.remove(f, P, a.id);
    expect(await normalSaves.list(f, P)).toHaveLength(0);
  });

  it('prunes auto saves to the newest N', async () => {
    const f = createMemFileStore();
    const dir = `profiles/${P}/saves/auto`;
    const entries = Array.from({ length: 7 }, (_, i) => ({ id: String(i + 1), timestamp: i + 1, trigger: 'timer' as const }));
    for (const e of entries) await f.writeBytes(`${dir}/${e.id}.sav`, bytes(2, 0));
    await f.writeText(`${dir}/manifest.json`, JSON.stringify(entries));
    await autoSaves.prune(f, P, 5);
    expect(await autoSaves.list(f, P)).toHaveLength(5);
  });
});
