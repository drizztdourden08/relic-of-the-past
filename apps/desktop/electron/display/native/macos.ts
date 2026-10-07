/* @layer electron-main @kind logic */
/**
 * macOS refresh-rate driver, via CoreGraphics + CoreFoundation through koffi.
 *
 * CGDisplayModeGetRefreshRate returns 0 for displays that do not report a rate, so a 0
 * means "unknown" and is filtered out.
 *
 * NOT VERIFIED ON HARDWARE. Written from the documented CoreGraphics surface (opaque
 * handles only), and every path reports failure softly, so the worst case on an untested
 * Mac is the setting declaring itself unavailable.
 */
import type { DisplayModeDriver } from './types';
import { loadKoffi } from './koffi-loader';

const CORE_GRAPHICS = '/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics';
const CORE_FOUNDATION = '/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation';

interface MacBindings {
  mainDisplayId: (...args: unknown[]) => number;
  copyAllModes: (...args: unknown[]) => unknown;
  copyCurrentMode: (...args: unknown[]) => unknown;
  refreshRate: (...args: unknown[]) => number;
  width: (...args: unknown[]) => number;
  height: (...args: unknown[]) => number;
  count: (...args: unknown[]) => number;
  valueAt: (...args: unknown[]) => unknown;
  setMode: (...args: unknown[]) => number;
  release: (...args: unknown[]) => void;
}

let bindings: MacBindings | null = null;
let bindingError = '';

const buildBindings = (): MacBindings | null => {
  const koffi = loadKoffi();
  if (!koffi) {
    bindingError = 'the native display binding could not be loaded';
    return null;
  }
  try {
    const cg = koffi.load(CORE_GRAPHICS);
    const cf = koffi.load(CORE_FOUNDATION);
    return {
      mainDisplayId: cg.func('uint32_t CGMainDisplayID()'),
      copyAllModes: cg.func('void *CGDisplayCopyAllDisplayModes(uint32_t display, void *options)'),
      copyCurrentMode: cg.func('void *CGDisplayCopyDisplayMode(uint32_t display)'),
      refreshRate: cg.func('double CGDisplayModeGetRefreshRate(void *mode)'),
      width: cg.func('size_t CGDisplayModeGetWidth(void *mode)'),
      height: cg.func('size_t CGDisplayModeGetHeight(void *mode)'),
      setMode: cg.func('int32_t CGDisplaySetDisplayMode(uint32_t display, void *mode, void *options)'),
      count: cf.func('long CFArrayGetCount(void *array)'),
      valueAt: cf.func('void *CFArrayGetValueAtIndex(void *array, long index)'),
      release: cf.func('void CFRelease(void *ref)'),
    };
  } catch (e) {
    bindingError = `the native display binding failed to initialise (${e instanceof Error ? e.message : String(e)})`;
    return null;
  }
};

const getBindings = (): MacBindings | null => {
  if (bindings === null && !bindingError) bindings = buildBindings();
  return bindings;
};

/**
 * Run `fn` against the modes matching the current resolution, then release: the two Copy
 * calls transfer ownership, so skipping it would leak on every poll.
 */
const withModes = <T>(fn: (api: MacBindings, modes: unknown[], current: unknown) => T, fallback: T): T => {
  const api = getBindings();
  if (!api) return fallback;
  let list: unknown = null;
  let current: unknown = null;
  try {
    const display = api.mainDisplayId();
    list = api.copyAllModes(display, null);
    current = api.copyCurrentMode(display);
    if (!list || !current) return fallback;
    const w = api.width(current);
    const h = api.height(current);
    const modes: unknown[] = [];
    const total = api.count(list);
    for (let i = 0; i < total; i++) {
      const mode = api.valueAt(list, i);
      if (api.width(mode) === w && api.height(mode) === h) modes.push(mode);
    }
    return fn(api, modes, current);
  } catch {
    return fallback;
  } finally {
    try { if (list) api.release(list); } catch { /* already gone */ }
    try { if (current) api.release(current); } catch { /* already gone */ }
  }
};

const listRates = (): number[] => withModes((api, modes) => {
  const rates = new Set<number>();
  for (const mode of modes) {
    const hz = Math.round(api.refreshRate(mode));
    if (hz > 0) rates.add(hz);
  }
  return [...rates].sort((a, b) => a - b);
}, []);

const currentRate = (): number | null => withModes((api, _modes, current) => {
  const hz = Math.round(api.refreshRate(current));
  return hz > 0 ? hz : null;
}, null);

const setRate = (hz: number): boolean => withModes((api, modes) => {
  const match = modes.find((mode) => Math.round(api.refreshRate(mode)) === hz);
  if (!match) return false;
  return api.setMode(api.mainDisplayId(), match, null) === 0;
}, false);

const createMacDriver = (): DisplayModeDriver => {
  const ready = getBindings() !== null;
  return {
    platform: 'darwin',
    available: ready,
    unavailableReason: ready ? '' : bindingError,
    listRates,
    currentRate,
    setRate,
  };
};

export { createMacDriver };
