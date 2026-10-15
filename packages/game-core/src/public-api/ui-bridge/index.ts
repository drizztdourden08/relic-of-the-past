/* @layer package @kind barrel */
export { announceCoreMusic } from '../../bridge/announce-music';
export { setDeluxeEntrances } from '../../bridge/deluxe-entrances';
export { wasmDialogMarkStale, wasmRestoreDialogHookState } from '../../bridge/dialog';
export { reassertHostGates, resetHostGates, setExternalAmbient, setExternalMusic, setExternalSfx, setSoundTrace } from '../../bridge/host-gates';
export { restoreCoreMusic } from '../../bridge/restore-music';
export { canPreviewOriginals, renderOriginalSound } from '../../bridge/sound-preview';
export type { PreviewTarget } from '../../bridge/sound-preview';
export { linesAbovePicture, viewOrigin } from '../../bridge/view-origin';
export { voidCall } from '../../bridge/wasm-call';
export { paintTexture } from '../../dialog-texture/paint-texture';
export { activeAlphabet } from '../../dialog/active-alphabet';
export { initDialogBridge, pollDialogFrame, resyncDialogFrames, stopDialogBridge } from '../../dialog/dialog-bridge';
export { clearGlyphAtlas, getGlyphAtlas } from '../../dialog/glyph-atlas';
export { INACTIVE_FRAME } from '../../dialog/parse-dialog-state';
export { stateChanged } from '../../ui-bridge-diff';
export { parseGameUIBuffer } from '../../ui-bridge-parser';
export { stopUIBridge } from '../../ui-bridge/stop-ui-bridge';
export { uiBridgeState } from '../../ui-bridge/ui-bridge-state';
