/* @layer renderer-lib @kind constants */
import type { OsKind, HostShell } from '@drizztdourden08/brock-core';

const HOST_LABEL: Record<HostShell, string> = {
  electron: 'Electron',
  capacitor: 'Capacitor',
  web: 'Web',
};

const OS_LABEL: Record<OsKind, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  android: 'Android',
  ios: 'iOS',
  unknown: 'Unknown',
};

export { HOST_LABEL, OS_LABEL };
