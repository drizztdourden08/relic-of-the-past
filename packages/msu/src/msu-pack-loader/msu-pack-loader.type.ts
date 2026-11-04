/* @layer bridge-wasm @kind types */
import type { effectivePackManifest } from '@drizztdourden08/brock-msu/packs';
import type { mergeSettings } from '@rotp/game-core';

type Settings = ReturnType<typeof mergeSettings>;

type PackSessionInput = {
  packName: string;
  manifest: Parameters<typeof effectivePackManifest>[2];
  tracks: Parameters<typeof effectivePackManifest>[3];
  variant?: string;
  settings: Settings;
};

export type { PackSessionInput, Settings };
