/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import * as roms from '@shared/storage/roms';
import * as profiles from '@shared/storage/profiles';
import { createMemFileStore } from './mem-file-store';

describe('roms store (over FileStore)', () => {
  it('imports a raw ROM and reports status', async () => {
    const f = createMemFileStore();
    const r = await roms.importBytes(f, 'game.sfc', new Uint8Array(1024));
    expect(r).toMatchObject({ success: true, romFile: 'game.sfc', alreadyExists: false });
    expect(await roms.listRoms(f)).toEqual(['game.sfc']);
    expect((await roms.listWithStatus(f))[0]).toMatchObject({ romFile: 'game.sfc', hasAssets: false });
  });

  it('detects a duplicate import', async () => {
    const f = createMemFileStore();
    await roms.importBytes(f, 'game.sfc', new Uint8Array(8));
    expect((await roms.importBytes(f, 'game.sfc', new Uint8Array(8))).alreadyExists).toBe(true);
  });

  it('extracts a single ROM from a ZIP', async () => {
    const f = createMemFileStore();
    const zip = new JSZip();
    zip.file('cool.sfc', new Uint8Array([1, 2, 3]));
    const zipBytes = await zip.generateAsync({ type: 'uint8array' });
    const r = await roms.importBytes(f, 'pack.zip', zipBytes);
    expect(r).toMatchObject({ success: true, romFile: 'cool.sfc' });
    expect(await roms.listRoms(f)).toEqual(['cool.sfc']);
  });

  it('getInfo returns size + 16-char hash', async () => {
    const f = createMemFileStore();
    await roms.importBytes(f, 'game.sfc', new Uint8Array([1, 2, 3, 4]));
    const info = await roms.getInfo(f, 'game.sfc');
    expect(info?.size).toBe(4);
    expect(info?.hash).toHaveLength(16);
  });

  it('delete cascades to profiles using the ROM', async () => {
    const f = createMemFileStore();
    await roms.importBytes(f, 'game.sfc', new Uint8Array(4));
    await profiles.createProfile(f, 'P', 'game.sfc');
    await roms.deleteRom(f, 'game.sfc');
    expect(await roms.listRoms(f)).toEqual([]);
    expect(await profiles.listProfiles(f)).toHaveLength(0);
  });
});
