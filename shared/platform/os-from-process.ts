/* @layer shared-platform @kind logic */
import type { OsKind } from './platform-info.type';

const osFromProcess = (platform: string | undefined): OsKind =>
  platform === 'win32' ? 'windows'
    : platform === 'darwin' ? 'macos'
      : platform === 'linux' ? 'linux'
        : 'unknown';

export { osFromProcess };
