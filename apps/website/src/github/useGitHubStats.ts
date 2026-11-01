/* @layer website-site @kind hook */
import { REPO_API_URL } from '../repo';
import { useFetchJson } from './useFetchJson';
import type { GitHubStats, RepoJson } from './github.type';

const useGitHubStats = (): GitHubStats | null => {
  const state = useFetchJson<RepoJson>(REPO_API_URL);
  if (state.status !== 'ready') return null;
  const { stargazers_count, forks_count, open_issues_count } = state.data;
  return { stars: stargazers_count, forks: forks_count, openIssues: open_issues_count };
};

export { useGitHubStats };
