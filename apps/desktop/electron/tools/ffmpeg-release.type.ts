/* @layer electron-main @kind types */
interface GithubReleaseAsset {
  name: string;
  size: number;
  digest: string | null;
  browser_download_url: string;
}

export type { GithubReleaseAsset };
