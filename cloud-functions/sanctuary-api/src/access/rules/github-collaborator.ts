/* @layer root-config @kind logic */
/** A maintainer read token asks the repository whether the linked login is a
 *  collaborator; the user's own token is not needed. 204 means yes, 404 no. A
 *  collaborator lands in the default group; the chain only asks when no other
 *  source gave the user a group. */
import { DEFAULT_GROUP_ID } from '../../../../../shared/sanctuary';
import { readEnv } from '../../env';
import type { GroupRule } from '../access-rule.type';

const API = 'https://api.github.com';
const IS_COLLABORATOR = 204;

const githubCollaboratorGroups: GroupRule = async ({ identities }) => {
  const github = identities.find((identity) => identity.provider === 'github');
  if (!github) return [];
  const env = readEnv();
  const res = await fetch(`${API}/repos/${env.GITHUB_REPO}/collaborators/${encodeURIComponent(github.handle)}`, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_READ_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'sanctuary-api',
    },
  });
  return res.status === IS_COLLABORATOR ? [DEFAULT_GROUP_ID] : [];
};

export { githubCollaboratorGroups };
