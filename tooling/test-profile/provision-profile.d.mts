/* @layer tooling-scripts @kind types */
type ProvisionOptions = {
  name: string;
  romFile?: string;
  inheritConfigFrom?: string;
  quickSlot?: number | null;
  seedFixtureSaves?: boolean;
  seedCheats?: boolean;
};

type ProvisionResult = {
  dir: string;
  romFile: string;
  inheritedFrom: string | null;
  savesCopied: unknown;
  fixturesCopied: unknown;
  quickSaveCopied: unknown;
};

export declare const provisionProfile: (options: ProvisionOptions) => Promise<ProvisionResult>;
