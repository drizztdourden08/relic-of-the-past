/* @layer electron-main @kind logic */
import { execFileSync } from 'child_process';
import { NOTIFY_SCRIPT } from './document-associations.constants';

const notifyShell = (): void => {
  try {
    execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', NOTIFY_SCRIPT], {
      stdio: 'ignore', windowsHide: true, timeout: 10_000,
    });
  } catch {
    return;
  }
};

export { notifyShell };
