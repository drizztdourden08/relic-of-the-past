/* @layer electron-main @kind logic */
/**
 * Test/automation startup flags, parsed from process.argv:
 *
 *   --window-size[=WxH]  Open at a fixed size (default 1280x800); saved geometry is not applied.
 *   --widgets=a,b,c      Open these widgets docked on their default side, on a clean layout.
 *   --fresh              Ignore the saved widget layout, open nothing (no home menu), and
 *                        do NOT persist layout/window changes.
 *   --muted              Mute the app once it is up, exactly as the speaker button does.
 *   --sound              The opposite signal, for a profile that was left muted.
 *   --auto-start         Boot the game with the active profile to its title screen. No
 *                        state is loaded; that is what --auto-state is for.
 *
 * Window size is consumed in the main process (create-window); the rest are forwarded
 * to the renderer via webPreferences.additionalArguments.
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
  // Muting is the app's own setting: --muted sets the starting volume, which the
  // in-app control then owns, instead of being imposed on the window from outside.
  if (process.argv.includes('--muted')) args.push('--startup-muted');
  if (process.argv.includes('--sound')) args.push('--startup-sound');
  // Starting the game is a renderer action (it owns the profile and the module).
  if (process.argv.includes('--auto-start')) args.push('--startup-auto-start');
  // The renderer does not inherit main's argv, so --instance and --profile are forwarded.
  const instance = parseInstanceConfig();
  if (instance.name) args.push(`--startup-instance=${instance.name}`);
  if (instance.profile) args.push(`--startup-profile=${instance.profile}`);
  // The renderer owns the app.json write, so it needs the automation verdict too.
  if (isAutomationLaunch()) args.push('--startup-automation');
  return args;
};

/**
 * Test/automation launches must not persist window or layout state over the user's.
 * Delegates to the one automation predicate so every automation flag is covered.
 */
const isEphemeralLaunch = (): boolean => isAutomationLaunch();

export { parseStartupConfig, startupRendererArgs, isEphemeralLaunch };
export type { StartupConfig };
