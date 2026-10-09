/* @layer bridge-wasm @kind types */
import type { effectivePackManifest } from '@shared/storage/msu-classic-manifest';
import type { mergeSettings } from '../settings';

type Settings = ReturnType<typeof mergeSettings>;

type PackSessionInput = {
  packName: string;
  manifest: Parameters<typeof effectivePackManifest>[1];
  tracks: Parameters<typeof effectivePackManifest>[2];
  isDeluxe: boolean;
  settings: Settings;
};

export type { PackSessionInput, Settings };
