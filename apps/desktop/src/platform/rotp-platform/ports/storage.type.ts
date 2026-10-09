/* @layer shared-platform @kind types */
type DataDomain = 'profiles' | 'roms' | 'saves' | 'sprites' | 'linkSprites' | 'languages' | 'msu' | 'assets';

interface DataLocation {
  path: string;
  osLabel: string;
  canReveal: boolean;
}

interface DomainUsage {
  domain: DataDomain;
  label: string;
  count: number;
  bytes: number;
}

interface StorageSummary {
  location: DataLocation;
  domains: DomainUsage[];
  totalBytes: number;
}

interface StoragePort {
  getLocation: () => Promise<DataLocation>;
  reveal: () => Promise<void>;
  revealProfile: (profileId: string) => Promise<boolean>;
  getSummary: () => Promise<StorageSummary>;
  spritesBaseUrl: (romFile: string) => Promise<string>;
}

export type { DataDomain, DataLocation, DomainUsage, StorageSummary, StoragePort };
