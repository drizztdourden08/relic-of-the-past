/* @layer electron-main @kind logic */
/**
 * Lazy, cached koffi load.
 *
 * Required with a runtime require rather than a static import so that a missing or
 * unloadable binding degrades to "this setting is unavailable" instead of taking the whole
 * app down at startup. koffi is Node-API based, so it loads under Electron's ABI without a
 * rebuild (verified against Electron 42 / Node 24).
 *
 * Only ever reached from the main process — it is native code and has no business in the
 * renderer or in the mobile bundle.
 */

// Untyped on purpose: we use a narrow slice of koffi's dynamic FFI surface, where the shapes
// are decided at runtime by the struct and function declarations we hand it.
type Koffi = any;

let cached: Koffi | null = null;
let attempted = false;

const loadKoffi = (): Koffi | null => {
  if (attempted) return cached;
  attempted = true;
  try {
    cached = require('koffi');
  } catch {
    cached = null;
  }
  return cached;
};

export { loadKoffi };
export type { Koffi };
