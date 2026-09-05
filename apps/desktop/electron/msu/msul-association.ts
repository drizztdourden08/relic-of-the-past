/* @layer electron-main @kind logic */
/**
 * Registering the `.msul` document type with Windows, and taking it back out.
 *
 * electron-builder only writes the association through its NSIS/MSI installers, and Windows
 * ships through Velopack from a plain directory build, which registers no file types.
 *
 * Written under HKCU classes (no elevation, right for a per-user install) via `reg.exe` with
 * an argument array: no dependency, no shell quoting.
 *
 * Runs inside Velopack's fast callbacks, which exit the process the moment the callback
 * returns, so the work is synchronous on purpose. A failure is logged and swallowed: it must
 * never turn into an install that did not complete.
 */
import { execFileSync } from 'child_process';
import { join } from 'path';

const EXTENSION = '.msul';
const PROG_ID = 'RelicOfThePast.MusicPack';
const CLASSES = 'HKCU\\Software\\Classes';
const PROG_KEY = `${CLASSES}\\${PROG_ID}`;
const EXT_KEY = `${CLASSES}\\${EXTENSION}`;

/** Shipped as an extra resource. See the electron-builder config. */
const iconPath = (): string => join(process.resourcesPath, 'msul.ico');

const reg = (args: string[]): void => {
  execFileSync('reg.exe', args, { stdio: 'ignore', windowsHide: true });
};

/** A string value on a key, the key's default when `name` is null. Creates the key as needed. */
const setValue = (key: string, name: string | null, data: string): void => {
  reg(['add', key, ...(name === null ? ['/ve'] : ['/v', name]), '/t', 'REG_SZ', '/d', data, '/f']);
};

const deleteKey = (key: string): void => {
  try { reg(['delete', key, '/f']); } catch { /* already absent */ }
};

/**
 * Tells the shell the associations changed. Without this a running Explorer keeps showing
 * "MSUL File" with a blank icon until restarted (verified). No Node binding exists, so it goes
 * through a one-line PowerShell; best effort, the keys are already written by then.
 */
const NOTIFY_SCRIPT = 'Add-Type -MemberDefinition \'[DllImport("shell32.dll")] public static extern void SHChangeNotify(int e, uint f, IntPtr a, IntPtr b);\' -Name N -Namespace W; [W.N]::SHChangeNotify(0x08000000, 0x1000, [IntPtr]::Zero, [IntPtr]::Zero)';

const notifyShell = (): void => {
  try {
    execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', NOTIFY_SCRIPT], {
      stdio: 'ignore', windowsHide: true, timeout: 10_000,
    });
  } catch { /* the registration stands; Explorer catches up on its next restart */ }
};

const registerMsulAssociation = (): void => {
  if (process.platform !== 'win32') return;
  try {
    setValue(EXT_KEY, null, PROG_ID);
    setValue(EXT_KEY, 'Content Type', 'application/x-msul');
    setValue(PROG_KEY, null, 'Music Pack');
    setValue(`${PROG_KEY}\\DefaultIcon`, null, `"${iconPath()}",0`);
    setValue(`${PROG_KEY}\\shell\\open\\command`, null, `"${process.execPath}" "%1"`);
    notifyShell();
  } catch (err) {
    console.error(`[msul] could not register the file type: ${err instanceof Error ? err.message : String(err)}`);
  }
};

const unregisterMsulAssociation = (): void => {
  if (process.platform !== 'win32') return;
  deleteKey(EXT_KEY);
  deleteKey(PROG_KEY);
  notifyShell();
};

export { registerMsulAssociation, unregisterMsulAssociation };
