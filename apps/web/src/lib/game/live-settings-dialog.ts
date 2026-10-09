/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { toQ4 } from '@shared/game/dialog/pacing';
import { hexToSnes15 } from '@shared/game/dialog/highlight-color';
import { isQuietReceipt } from '@shared/game/quiet-receipts';
import { getModule } from './wasm-bridge';
import { setQuietReceiptBits } from './gate-word-5';

const callUnlessCoreIsOlder = (call: () => void): void => {
  try {
    call();
  } catch {
    return;
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
