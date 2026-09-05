/* @layer renderer-lib @kind logic */
/**
 * Read and write a Relic Sprite Pack.
 *
 * A zip, so the contents stay inspectable with ordinary tools and the format can grow an
 * entry without breaking readers that ignore it. The tiles go in raw, not as a PNG:
 * the sheet is 4bpp indexed data, and a PNG round trip would mean re-deriving indices from
 * colours. A PNG is written alongside anyway, purely so the file previews in an image
 * viewer, and it is never read back.
 */
import JSZip from 'jszip';
import { SHEET_BYTES } from '@shared/game/data/player-sheet/types';
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
import { RSP_VERSION, MANIFEST_ENTRY, SHEET_ENTRY, PREVIEW_ENTRY } from './rsp.type';
import type { RspManifest, RspSource, RspExtras } from './rsp.type';
import { renderSheetPng } from './player-sheet/sheet-png';

const isRspName = (name: string): boolean => /\.rsp$/i.test(name);

const manifestOf = (sheet: PlayerSheet, source?: RspSource, extras?: RspExtras): RspManifest => ({
  format: 'rsp',
  version: RSP_VERSION,
  meta: sheet.meta,
  palettes: { original: sheet.original, override: sheet.override },
  ...(extras ? { extras } : {}),
  ...(source ? { source } : {}),
});

interface RspWriteOptions {
  source?: RspSource;
  extras?: RspExtras;
  /** Skip the courtesy PNG. It costs a render, which a boot-time flatten does not want. */
  withPreview?: boolean;
}

const toRspBytes = async (sheet: PlayerSheet, options: RspWriteOptions = {}): Promise<Uint8Array> => {
  const { source, extras, withPreview = true } = options;
  const zip = new JSZip();
  zip.file(MANIFEST_ENTRY, JSON.stringify(manifestOf(sheet, source, extras), null, 2));
  zip.file(SHEET_ENTRY, sheet.pixels.subarray(0, SHEET_BYTES));
  if (withPreview) {
    const png = renderSheetPng(sheet);
    if (png) zip.file(PREVIEW_ENTRY, png);
  }
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
};

/** A zip's local file header. Cheap enough to check before handing bytes to JSZip. */
const looksLikeZip = (bytes: Uint8Array): boolean =>
  bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;

const parseRsp = async (bytes: Uint8Array): Promise<PlayerSheet | null> => {
  if (!looksLikeZip(bytes)) return null;
  try {
    const zip = await JSZip.loadAsync(bytes);
    const manifestFile = zip.file(MANIFEST_ENTRY);
    const sheetFile = zip.file(SHEET_ENTRY);
    if (!manifestFile || !sheetFile) return null;

    const manifest = JSON.parse(await manifestFile.async('string')) as RspManifest;
    if (manifest.format !== 'rsp' || !manifest.palettes?.original) return null;

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

export { toRspBytes, parseRsp, isRspName, manifestOf };
export type { RspWriteOptions };
