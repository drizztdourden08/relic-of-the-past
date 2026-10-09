/* @layer electron-main @kind types */
import type { createInstalledRegistry } from './create-installed-registry';

type InstalledRegistryStore = ReturnType<typeof createInstalledRegistry>;

export type { InstalledRegistryStore };
