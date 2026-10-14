/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { toQ4, hexToSnes15, isQuietReceipt } from '@rotp/game-data';
import { getModule } from '@rotp/game-core';
import { setQuietReceiptBits } from './gate-word-5';

const ignoreMissingCoreExport = (): void => undefined;

const callUnlessCoreIsOlder = (call: () => void): void => {
  try {
    call();
  } catch {
    ignoreMissingCoreExport();
  }
};

const pushDialogLive = (settings: GameSettings): void => {
  const mod = getModule();
  if (!mod) return;
  setQuietReceiptBits({
    rupees: isQuietReceipt(settings, 'rupees'),
    bombs: isQuietReceipt(settings, 'bombs'),
    arrows: isQuietReceipt(settings, 'arrows'),
  });
  const { dialogSpeed, dialogHoldSpeed, dialogHoldToAccelerate, dialogFillOnB, dialogTypewriter, dialogBox } = settings;
  callUnlessCoreIsOlder(() => mod.ccall('WasmSetDialogPacing', null, ['number', 'number', 'number', 'number', 'number'],
    [toQ4(dialogSpeed), toQ4(dialogHoldSpeed), dialogHoldToAccelerate ? 1 : 0, dialogFillOnB ? 1 : 0, dialogTypewriter ? 1 : 0]));
  const nativeBoxHidden = dialogBox === 'enhanced';
  callUnlessCoreIsOlder(() => mod.ccall('WasmSetDialogHidden', null, ['number'], [nativeBoxHidden ? 1 : 0]));
  callUnlessCoreIsOlder(() => mod.ccall('WasmSetDialogHighlightColors', null, ['number', 'number'],
    [hexToSnes15(settings.hudHighlightPrimary), hexToSnes15(settings.hudHighlightSecondary)]));
};

export { pushDialogLive };
