/* @layer electron-main @kind types */
interface ResolvedFfmpegAsset {
  downloadUrl: string;
  sizeBytes: number;
  sha256: string;
}

interface GithubReleaseAsset {
  name: string;
  size: number;
  digest: string | null;
  browser_download_url: string;
}

export type { GithubReleaseAsset, ResolvedFfmpegAsset };
