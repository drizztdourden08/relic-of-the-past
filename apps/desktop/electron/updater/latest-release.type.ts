/* @layer electron-main @kind types */
interface GithubRelease {
  tag_name: string;
  body?: string;
  draft: boolean;
  prerelease: boolean;
  published_at?: string;
  assets?: { name: string }[];
}

export type { GithubRelease };
