/* @layer hub-core @kind logic */
import { DEFAULT_GROUP_ID } from '@rotp/hub-contracts';
import { readHubEnv } from '../../env';
import type { GroupRule } from '../access-rule.type';
import { GITHUB_API, IS_COLLABORATOR } from './github-collaborator.constants';

const githubCollaboratorGroups: GroupRule = async ({ identities }) => {
  const github = identities.find((identity) => identity.provider === 'github');
  if (!github) return [];
  const env = readHubEnv();
  const res = await fetch(`${GITHUB_API}/repos/${env.GITHUB_REPO}/collaborators/${encodeURIComponent(github.handle)}`, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_READ_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'sanctuary-api',
    },
  });
  return res.status === IS_COLLABORATOR ? [DEFAULT_GROUP_ID] : [];
};

export { githubCollaboratorGroups };
