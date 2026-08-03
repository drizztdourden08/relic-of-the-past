/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import * as msu from '@shared/storage/msu';
import * as sprites from '@shared/storage/sprites';
import * as languages from '@shared/storage/languages';
import { createMemFileStore } from './mem-file-store';

const bytes = (n: number): Uint8Array => new Uint8Array(n).fill(1);

describe('msu store (over FileStore)', () => {
  it('installs tracks and lists packs/tracks', async () => {
    const f = createMemFileStore();
    await msu.installTracks(f, 'cool', [{ name: '1.pcm', bytes: bytes(8) }, { name: '2.opuz', bytes: bytes(4) }, { name: 'msu.msu', bytes: bytes(2) }]);
    expect((await msu.listPacks(f))[0]).toMatchObject({ name: 'cool', fileCount: 3 });
    expect(await msu.getTrackList(f, 'cool')).toHaveLength(2);
    expect((await msu.getPackFiles(f, 'cool')).length).toBe(3);
    await msu.deletePack(f, 'cool');
    expect(await msu.listPacks(f)).toHaveLength(0);
  });
});

describe('sprites store (over FileStore)', () => {
  it('writes sprite buffers and reports extracted', async () => {
    const f = createMemFileStore();
    await sprites.writeSprites(f, 'game.sfc', [{ name: 'hud-a.png', bytes: bytes(10) }, { name: 'hud-b.png', bytes: bytes(10) }]);
    expect(await sprites.check(f, 'game.sfc')).toMatchObject({ extracted: true, count: 2 });
    await sprites.remove(f, 'game.sfc');
    expect(await sprites.check(f, 'game.sfc')).toMatchObject({ extracted: false, count: 0 });
  });
});

describe('languages store (over FileStore)', () => {
  it('writes a pack and lists it', async () => {
    const f = createMemFileStore();
    await languages.writePack(f, {
      code: 'fr', description: 'France', dialogue: '1: bonjour\n',
      fontData: bytes(16), fontWidth: bytes(4), glyphCount: 4, lineCount: 1, encoder: 'org', flags: 1,
    });
    expect((await languages.list(f))[0]).toMatchObject({ code: 'fr', glyphCount: 4, lineCount: 1 });
  });
});
