/* @layer electron-main @kind logic */
/**
 * Test/automation startup flags, parsed from process.argv:
 *
 *   --window-size[=WxH]  Open at a fixed size (default 1280x800) instead of the saved
 *                        one, and stay there — the saved geometry is not applied.
 *   --widgets=a,b,c      Open these widgets docked (shrinking the game area) with
 *                        their default side, on top of a clean layout.
 *   --fresh              Ignore the saved widget layout, start with nothing open
 *                        (no home menu), and do NOT persist layout/window changes.
 *   --muted              Start with the app's own master volume at zero.
 *   --auto-start         Boot the game with the active profile and stop there, so the
 *                        game's own title screen comes up and the profile's SRAM files
 *                        are there to continue from. No state is loaded — that is what
 *                        --auto-state is for.
 *
 * Window size is consumed in the main process (create-window); widgets/fresh/muted are
 * forwarded to the renderer via webPreferences.additionalArguments.
 */

import { isAutomationLaunch, parseInstanceConfig } from '../instance';

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
  // Muting is the app's own setting, so --muted travels to the renderer like any other
  // renderer-bound flag rather than being imposed on the window from outside. One
  // mechanism for every launch shape: the volume the app starts at, which its own
  // control then owns.
  if (process.argv.includes('--muted')) args.push('--startup-muted');
  // Starting the game is a renderer action (it owns the profile and the module), so the
  // flag travels rather than being acted on here.
  if (process.argv.includes('--auto-start')) args.push('--startup-auto-start');
  // The renderer process does not inherit the main process's argv, so --instance and
  // --profile have to be forwarded explicitly like every other renderer-bound flag.
  const instance = parseInstanceConfig();
  if (instance.name) args.push(`--startup-instance=${instance.name}`);
  if (instance.profile) args.push(`--startup-profile=${instance.profile}`);
  // The renderer needs the automation verdict too — it owns the app.json write.
  if (isAutomationLaunch()) args.push('--startup-automation');
  return args;
};

/**
 * Test/automation launches must not persist window or layout state over the user's.
 * Delegates to the one automation predicate, so every automation flag is covered —
 * not just the two that happened to be checked here first.
 */
const isEphemeralLaunch = (): boolean => isAutomationLaunch();

export { parseStartupConfig, startupRendererArgs, isEphemeralLaunch };
export type { StartupConfig };
