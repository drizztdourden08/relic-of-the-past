/* @layer shared-platform @kind logic */
/**
 * Storage-info port: where the app's data lives on this platform, a per-domain
 * usage summary, and (desktop only) revealing the folder in the OS file manager.
 * Backed by IPC on Electron and the Filesystem plugin on Capacitor.
 */

type DataDomain = 'profiles' | 'roms' | 'saves' | 'sprites' | 'languages' | 'msu' | 'assets';

interface DataLocation {
  path: string; // absolute Data root on this platform
  osLabel: string; // e.g. "Windows (AppData)", "Android (app storage)"
  canReveal: boolean; // mirrors the revealDataFolder capability
}

interface DomainUsage {
  domain: DataDomain;
  label: string;
  count: number; // entries (profiles, roms, packs, sprite sets, languages)
  bytes: number; // disk usage
}

interface StorageSummary {
  location: DataLocation;
  domains: DomainUsage[];
  totalBytes: number;
}

interface StoragePort {
  getLocation: () => Promise<DataLocation>;
  reveal: () => Promise<void>; // no-op when !canReveal
  getSummary: () => Promise<StorageSummary>;
  // Base URL for a ROM's extracted sprites (app-sprite:// on Electron,
  // Capacitor.convertFileSrc on mobile); ends with '/'. Empty when unavailable.
  spritesBaseUrl: (romFile: string) => Promise<string>;
}

export type { DataDomain, DataLocation, DomainUsage, StorageSummary, StoragePort };
