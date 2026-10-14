/* @layer shared-storage @kind logic */
import JSZip from 'jszip';
import { SHEET_BYTES } from '@rotp/game-data';
import type { PaletteOverride, PlayerSheet, SheetMeta, SheetPalette } from '@rotp/game-data';
import { MANIFEST_ENTRY, SHEET_ENTRY, isRspManifest } from '@rotp/hub-contracts';
import { looksLikeZip } from './looks-like-zip';

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

    const palettes: { original: SheetPalette; override?: PaletteOverride } = manifest.palettes;
    const shortAuthor: Partial<Pick<SheetMeta, 'authorShort'>> = manifest.meta;
    return {
      pixels,
      original: palettes.original,
      override: palettes.override ?? {},
      meta: { ...manifest.meta, authorShort: shortAuthor.authorShort ?? '' },
    };
  } catch {
    return null;
  }
};

export { parseRsp };
