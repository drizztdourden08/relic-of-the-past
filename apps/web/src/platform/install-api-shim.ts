/* @layer renderer-other @kind logic */
/**
 * Side-effect module: installs the boot-safe window.api shim on non-Electron
 * hosts. Imported FIRST in main.tsx so it runs before the App import graph reads
 * window.api. On Electron the real preload api is present, so this is a no-op.
 */
import { detectHost } from '@shared/platform';
import { installApiShim } from './api-shim';

if (detectHost() !== 'electron') {
  installApiShim();
}
