/* @layer renderer-lib @kind logic */
import JSZip from 'jszip';
import type { PlayerSheet } from '@rotp/game-data';
import type { RspWriteOptions } from './rsp.type';
import { SHEET_BYTES } from '@rotp/game-data';
import { MANIFEST_ENTRY, SHEET_ENTRY, PREVIEW_ENTRY } from '@rotp/hub-contracts';
import { renderSheetPng } from '../player-sheet/sheet-png';
import { manifestOf } from './manifest-of';

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

export { toRspBytes };
