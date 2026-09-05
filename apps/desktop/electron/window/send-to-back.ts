/* @layer electron-main @kind logic */
/**
 * Push a window to the BOTTOM of the OS z-order (behind other apps) without
 * activating it. Used by --no-focus launches so the test/automation window never
 * covers what the user is working on. Electron's showInactive() only avoids focus;
 * on Windows a newly shown window still lands on top of the z-order, so we call
 * Win32 SetWindowPos(HWND_BOTTOM) on the native handle. No-op off Windows (macOS
 * and most Linux WMs already honour showInactive's ordering).
 */
import { execFile } from 'child_process';
import type { BrowserWindow } from 'electron';

// SWP_NOSIZE | SWP_NOMOVE | SWP_NOACTIVATE; HWND_BOTTOM = 1.
const SWP_FLAGS = 0x13;

const readHwnd = (win: BrowserWindow): string | null => {
  const buf = win.getNativeWindowHandle();
  if (buf.length === 8) return buf.readBigUInt64LE().toString();
  if (buf.length === 4) return BigInt(buf.readUInt32LE()).toString();
  return null;
};

const sendWindowToBack = (win: BrowserWindow): void => {
  if (process.platform !== 'win32') return;
  const hwnd = readHwnd(win);
  if (!hwnd) return;

  // -EncodedCommand (UTF-16LE base64) sidesteps all shell/quote escaping.
  const script = [
    '$s=\'[DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h,IntPtr a,int x,int y,int cx,int cy,uint f);\';',
    '$t=Add-Type -MemberDefinition $s -Name Native -Namespace Win -PassThru;',
    `[void]$t::SetWindowPos([IntPtr]${hwnd},[IntPtr]1,0,0,0,0,${SWP_FLAGS});`,
  ].join('');
  const encoded = Buffer.from(script, 'utf16le').toString('base64');

  execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded], (err) => {
    if (err) console.error('[send-to-back] SetWindowPos failed:', err.message);
  });
};

export { sendWindowToBack };
