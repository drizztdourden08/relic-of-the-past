/* @layer electron-main @kind logic */
import { DEFAULT_WINDOW_SIZE } from './startup-config.constants';
import type { StartupConfig } from './startup-config.type';

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

export { parseStartupConfig };
