/* @layer website-site @kind hook */
import { CONTRIBUTORS_URL } from '../repo';
import { useFetchJson } from './useFetchJson';
import type { Contributor, ContributorJson } from './github.type';

const useContributors = (): Contributor[] => {
  const state = useFetchJson<ContributorJson[]>(CONTRIBUTORS_URL);
  if (state.status !== 'ready') return [];
  return state.data
    .filter((entry) => entry.type !== 'Bot')
    .map((entry) => ({
      login: entry.login,
      avatarUrl: entry.avatar_url,
      htmlUrl: entry.html_url,
      contributions: entry.contributions,
    }));
};

export { useContributors };
