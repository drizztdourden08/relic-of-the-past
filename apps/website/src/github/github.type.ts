/* @layer website-site @kind types */
type ReleaseAsset = {
  name: string;
  browser_download_url: string;
  size: number;
};

type Release = {
  tag_name: string;
  html_url: string;
  assets: ReleaseAsset[];
};

type RepoJson = {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
};

type GitHubStats = {
  stars: number;
  forks: number;
  openIssues: number;
};

type ContributorJson = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
};

type Contributor = {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  contributions: number;
};

export type { Contributor, ContributorJson, GitHubStats, Release, ReleaseAsset, RepoJson };
