/* @layer electron-main @kind constants */
import { INSTALL_SCHEME } from '@shared/store/deep-link';
import { appIcon } from './app-icon';
import type { DocumentType } from './document-associations.type';
import { msulIcon } from './msul-icon';

const CLASSES = 'HKCU\\Software\\Classes';
const PROTOCOL_KEY = `${CLASSES}\\${INSTALL_SCHEME}`;

const DOCUMENT_TYPES: DocumentType[] = [
  { extension: '.msul', progId: 'RelicOfThePast.MusicPack', name: 'Music Pack', contentType: 'application/x-msul', icon: msulIcon },
  { extension: '.rsp', progId: 'RelicOfThePast.SpritePack', name: 'Character Sprite', contentType: 'application/x-rsp', icon: appIcon },
  { extension: '.rlang', progId: 'RelicOfThePast.LanguageSet', name: 'Language Set', contentType: 'application/x-rlang', icon: appIcon },
];

const NOTIFY_SCRIPT = 'Add-Type -MemberDefinition \'[DllImport("shell32.dll")] public static extern void SHChangeNotify(int e, uint f, IntPtr a, IntPtr b);\' -Name N -Namespace W; [W.N]::SHChangeNotify(0x08000000, 0x1000, [IntPtr]::Zero, [IntPtr]::Zero)';

export { CLASSES, PROTOCOL_KEY, DOCUMENT_TYPES, NOTIFY_SCRIPT };
