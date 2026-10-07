/* @layer bridge-wasm @kind logic */
/**
 * The dialog half of a live settings push: pacing values, the native-box hide, the two
 * highlight colours of randomizer messages and the quiet receipt bits (gate word 5, which also
 * owns its own reassert after a load). All are host-side requests the core reconciles
 * against its gates every frame, so they are pushed at boot, on every settings change, and
 * again after a save-state load, like the HUD hides.
 */
import type { GameSettings } from '@shared/types/settings';
import { toQ4 } from '@shared/game/dialog/pacing';
import { hexToSnes15 } from '@shared/game/dialog/highlight-color';
import { isQuietReceipt } from '@shared/game/quiet-receipts';
import { getModule } from './wasm-bridge';
import { setQuietReceiptBits } from './gate-word-5';

const pushDialogLive = (settings: GameSettings): void => {
  const mod = getModule();
  if (!mod) return;
  setQuietReceiptBits({
    rupees: isQuietReceipt(settings, 'rupees'),
    bombs: isQuietReceipt(settings, 'bombs'),
    arrows: isQuietReceipt(settings, 'arrows'),
  });
  const { dialogSpeed, dialogHoldSpeed, dialogHoldToAccelerate, dialogFillOnB, dialogTypewriter, dialogBox } = settings;
  try {
    mod.ccall('WasmSetDialogPacing', null, ['number', 'number', 'number', 'number', 'number'],
      [toQ4(dialogSpeed), toQ4(dialogHoldSpeed), dialogHoldToAccelerate ? 1 : 0, dialogFillOnB ? 1 : 0, dialogTypewriter ? 1 : 0]);
  } catch { /* WASM not rebuilt yet */ }
  // The core itself keeps the native box up after a state load until the next message (WasmDialogMarkStale).
  const hidden = dialogBox === 'enhanced';
  try {
    mod.ccall('WasmSetDialogHidden', null, ['number'], [hidden ? 1 : 0]);
  } catch { /* WASM not rebuilt yet */ }
  try {
    mod.ccall('WasmSetDialogHighlightColors', null, ['number', 'number'],
      [hexToSnes15(settings.hudHighlightPrimary), hexToSnes15(settings.hudHighlightSecondary)]);
  } catch { /* WASM not rebuilt yet */ }
};

export { pushDialogLive };
