/* @layer electron-main @kind types */
import type { VelopackAsset } from 'velopack';

interface GithubAsset {
  name: string;
  browser_download_url: string;
}

interface GithubRelease {
  tag_name: string;
  body?: string;
  draft: boolean;
  prerelease: boolean;
  published_at?: string;
  assets?: GithubAsset[];
}

interface UpdatePlan {
  target: VelopackAsset;
  base?: VelopackAsset;
  deltas: VelopackAsset[];
  downloadSize: number;
}

export type { GithubAsset, GithubRelease, UpdatePlan };
