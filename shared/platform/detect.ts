/* @layer shared-platform @kind logic */
/**
 * Host + OS detection, reading runtime globals only. The Capacitor global is
 * probed without importing @capacitor/core so this stays dependency-free. The
 * Capacitor dep arrives with its host factory in a later phase.
 */
import type { HostShell, OsKind } from './types';

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

const capacitor = (): CapacitorGlobal | undefined =>
  typeof window !== 'undefined' ? (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor : undefined;

const detectHost = (): HostShell => {
  if (capacitor()?.isNativePlatform?.()) return 'capacitor';
  if (typeof window !== 'undefined' && window.api) return 'electron';
  return 'web';
};

const osFromProcess = (platform: string | undefined): OsKind =>
  platform === 'win32' ? 'windows'
    : platform === 'darwin' ? 'macos'
      : platform === 'linux' ? 'linux'
        : 'unknown';

export { detectHost, osFromProcess };
