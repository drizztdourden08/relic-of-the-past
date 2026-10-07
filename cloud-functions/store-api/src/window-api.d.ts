/* @layer store-api @kind types */
/** shared/platform reads `window.api`, the app's preload bridge, to tell its host apart. The
 *  store's manifest readers reach that file through a type import only, and this function
 *  never runs in a window, so the typecheck gets the bridge as unknown. */
interface Window {
  api?: unknown;
}
