/* @layer renderer-lib @kind logic */
import type { PlayerSheet, Wearing } from '@rotp/game-data';
import { DEFAULT_WEARING, SHEET_PNG_HEIGHT, SHEET_PNG_WIDTH } from './sheet-png.constants';
import { drawSheet } from './draw-sheet';

const renderSheetPng = (sheet: PlayerSheet, wearing: Wearing = DEFAULT_WEARING): Uint8Array | null => {
  const canvas = document.createElement('canvas');
  canvas.width = SHEET_PNG_WIDTH;
  canvas.height = SHEET_PNG_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  drawSheet(sheet, wearing, ctx);
  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
};

export { renderSheetPng };
