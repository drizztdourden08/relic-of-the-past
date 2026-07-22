/* @layer electron-main @kind logic */
/**
 * Test/automation startup flags, parsed from process.argv:
 *
 *   --window-size[=WxH]  Open at a fixed size (default 1280x800) instead of the
 *                        boot-splash size; skips the splash→saved-size growth.
 *   --widgets=a,b,c      Open these widgets docked (shrinking the game area) with
 *                        their default side, on top of a clean layout.
 *   --fresh              Ignore the saved widget layout, start with nothing open
 *                        (no home menu), and do NOT persist layout/window changes.
 *
 * Window size is consumed in the main process (create-window); widgets/fresh are
 * forwarded to the renderer via webPreferences.additionalArguments.
 */

interface StartupConfig {
  windowSize: { width: number; height: number } | null;
  widgets: string[];
  fresh: boolean;
}

const DEFAULT_WINDOW_SIZE = { width: 1280, height: 800 };

const parseStartupConfig = (): StartupConfig => {
  let windowSize: StartupConfig['windowSize'] = null;
  const widgets: string[] = [];
  let fresh = false;

  for (const arg of process.argv) {
    if (arg === '--window-size') { windowSize = DEFAULT_WINDOW_SIZE; continue; }
    const size = arg.match(/^--window-size=(\d+)x(\d+)$/);
    if (size) { windowSize = { width: parseInt(size[1], 10), height: parseInt(size[2], 10) }; continue; }
    const list = arg.match(/^--widgets=(.+)$/);
    if (list) { widgets.push(...list[1].split(',').map((s) => s.trim()).filter(Boolean)); continue; }
    if (arg === '--fresh') fresh = true;
  }

  return { windowSize, widgets, fresh };
};

/** Renderer-bound flags forwarded through additionalArguments (read in preload). */
const startupRendererArgs = (config: StartupConfig): string[] => {
  const args: string[] = [];
  if (config.fresh) args.push('--startup-fresh');
  if (config.widgets.length > 0) args.push(`--startup-widgets=${config.widgets.join(',')}`);
  return args;
};

/** Test/automation launches must not persist window or layout state over the user's. */
const isEphemeralLaunch = (): boolean => {
  const config = parseStartupConfig();
  return config.windowSize !== null || config.fresh;
};

export { parseStartupConfig, startupRendererArgs, isEphemeralLaunch };
export type { StartupConfig };
