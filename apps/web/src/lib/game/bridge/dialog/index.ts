/* @layer bridge-wasm @kind barrel */
export { wasmGetDialogHookState } from './wasm-get-dialog-hook-state';
export { wasmRestoreDialogHookState } from './wasm-restore-dialog-hook-state';
export { wasmGetDialogState } from './wasm-get-dialog-state';
export { wasmSetDialogPacing } from './wasm-set-dialog-pacing';
export { wasmSetDialogHidden } from './wasm-set-dialog-hidden';
export { wasmGetDialogFont } from './wasm-get-dialog-font';
export { wasmGetDialogPalette } from './wasm-get-dialog-palette';
export { wasmDialogMarkStale } from './wasm-dialog-mark-stale';
export type { FontView, HeapView } from './dialog.type';
