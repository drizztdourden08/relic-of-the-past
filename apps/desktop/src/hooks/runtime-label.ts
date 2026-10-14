/* @layer renderer-lib @kind logic */
import type { HostShell } from '@drizztdourden08/brock-core';
import { HOST_LABEL } from './debug-text-builder.constants';

const runtimeLabel = (host: HostShell, electron: string | undefined, capacitor: string | null): string => {
  if (host === 'electron' && electron) return `Electron ${electron}`;
  if (host === 'capacitor') return `Capacitor${capacitor ? ` ${capacitor}` : ''}`;
  return HOST_LABEL[host];
};

export { runtimeLabel };
