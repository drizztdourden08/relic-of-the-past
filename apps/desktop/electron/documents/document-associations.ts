/* @layer electron-main @kind logic */
/**
 * Registering the app's document types with Windows (`.msul` music packs, `.rsp` characters,
 * `.rlang` language sets), and taking them back out, along with the rotp:// link protocol the
 * app claims at run time.
 *
 * electron-builder only writes the associations through its NSIS/MSI installers, and Windows
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

type DocumentType = { extension: string; progId: string; name: string; contentType: string; icon: () => string };

const CLASSES = 'HKCU\\Software\\Classes';
const PROTOCOL_KEY = `${CLASSES}\\rotp`;

/** The .msul icon ships as an extra resource (see the electron-builder config); the others use the app's. */
const msulIcon = (): string => `"${join(process.resourcesPath, 'msul.ico')}",0`;
const appIcon = (): string => `"${process.execPath}",0`;

const DOCUMENT_TYPES: DocumentType[] = [
  { extension: '.msul', progId: 'RelicOfThePast.MusicPack', name: 'Music Pack', contentType: 'application/x-msul', icon: msulIcon },
  { extension: '.rsp', progId: 'RelicOfThePast.SpritePack', name: 'Character Sprite', contentType: 'application/x-rsp', icon: appIcon },
  { extension: '.rlang', progId: 'RelicOfThePast.LanguageSet', name: 'Language Set', contentType: 'application/x-rlang', icon: appIcon },
];

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

const registerType = (type: DocumentType): void => {
  const extKey = `${CLASSES}\\${type.extension}`;
  const progKey = `${CLASSES}\\${type.progId}`;
  setValue(extKey, null, type.progId);
  setValue(extKey, 'Content Type', type.contentType);
  setValue(progKey, null, type.name);
  setValue(`${progKey}\\DefaultIcon`, null, type.icon());
  setValue(`${progKey}\\shell\\open\\command`, null, `"${process.execPath}" "%1"`);
};

const registerDocumentAssociations = (): void => {
  if (process.platform !== 'win32') return;
  for (const type of DOCUMENT_TYPES) {
    try {
      registerType(type);
    } catch (err) {
      console.error(`[documents] could not register ${type.extension}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  notifyShell();
};

const unregisterDocumentAssociations = (): void => {
  if (process.platform !== 'win32') return;
  for (const type of DOCUMENT_TYPES) {
    deleteKey(`${CLASSES}\\${type.extension}`);
    deleteKey(`${CLASSES}\\${type.progId}`);
  }
  deleteKey(PROTOCOL_KEY);
  notifyShell();
};

export { registerDocumentAssociations, unregisterDocumentAssociations };
