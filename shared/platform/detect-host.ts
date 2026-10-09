/* @layer shared-platform @kind logic */
import type { CapacitorGlobal } from './capacitor-global.type';
import type { HostShell } from './platform-info.type';

const capacitor = (): CapacitorGlobal | undefined =>
  typeof window !== 'undefined' ? (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor : undefined;

const detectHost = (): HostShell => {
  if (capacitor()?.isNativePlatform?.()) return 'capacitor';
  if (typeof window !== 'undefined' && window.api) return 'electron';
  return 'web';
};

export { detectHost };
