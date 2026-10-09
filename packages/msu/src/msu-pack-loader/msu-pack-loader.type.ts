/* @layer bridge-wasm @kind types */
import type { effectivePackManifest } from '../classic-manifest';
import type { mergeSettings } from '@rotp/game-core';

type Settings = ReturnType<typeof mergeSettings>;

type PackSessionInput = {
  packName: string;
  manifest: Parameters<typeof effectivePackManifest>[1];
  tracks: Parameters<typeof effectivePackManifest>[2];
  isDeluxe: boolean;
  settings: Settings;
};

export type { PackSessionInput, Settings };
