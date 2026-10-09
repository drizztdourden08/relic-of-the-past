/* @layer electron-main @kind logic */
import { execFile } from 'child_process';
import type { BrowserWindow } from 'electron';
import { SWP_FLAGS } from './send-to-back.constants';

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
