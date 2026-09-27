/* @layer shared-storage @kind logic */
/**
 * Reads a Relic Sprite Pack back into a player sheet. The write side, which renders the
 * courtesy PNG, stays in the renderer (apps/web/src/lib/game/rsp.ts); reading needs no
 * canvas, so it lives here for every host: the renderer, Electron main and the store.
 */
import JSZip from 'jszip';
import { SHEET_BYTES } from '@shared/game/data/player-sheet/types';
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
import { MANIFEST_ENTRY, SHEET_ENTRY } from './rsp.type';
import type { RspManifest } from './rsp.type';

const isRspName = (name: string): boolean => /\.rsp$/i.test(name);

/** A zip's local file header. Cheap enough to check before handing bytes to JSZip. */
const looksLikeZip = (bytes: Uint8Array): boolean =>
  bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;

/** The manifest shape a pack must carry to be read at all. */
const isRspManifest = (value: unknown): value is RspManifest => {
  const manifest = value as RspManifest | null;
  return !!manifest && typeof manifest === 'object' && manifest.format === 'rsp'
    && !!manifest.palettes?.original && !!manifest.meta;
};

const parseRsp = async (bytes: Uint8Array): Promise<PlayerSheet | null> => {
  if (!looksLikeZip(bytes)) return null;
  try {
    const zip = await JSZip.loadAsync(bytes);
    const manifestFile = zip.file(MANIFEST_ENTRY);
    const sheetFile = zip.file(SHEET_ENTRY);
    if (!manifestFile || !sheetFile) return null;

    const manifest: unknown = JSON.parse(await manifestFile.async('string'));
    if (!isRspManifest(manifest)) return null;

    const pixels = await sheetFile.async('uint8array');
    if (pixels.length !== SHEET_BYTES) return null;

    return {
      pixels,
      original: manifest.palettes.original,
      override: manifest.palettes.override ?? {},
      meta: { ...manifest.meta, authorShort: manifest.meta.authorShort ?? '' },
    };
  } catch {
    return null;
  }
};

export { parseRsp, isRspName, isRspManifest, looksLikeZip };
