/* @layer root-config @kind logic */
/** A maintainer read token asks the repository whether the linked login is a
 *  collaborator; the user's own token is not needed. 204 means yes, 404 no. */
import { readEnv } from '../../env';
import type { AccessRule } from '../access-rule.type';

const API = 'https://api.github.com';

const githubCollaborator: AccessRule = async ({ identities }) => {
  const github = identities.find((identity) => identity.provider === 'github');
  if (!github) return null;
  const env = readEnv();
  const res = await fetch(`${API}/repos/${env.GITHUB_REPO}/collaborators/${encodeURIComponent(github.handle)}`, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_READ_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'sanctuary-api',
    },
  });
  return res.status === 204 ? 'github-collaborator' : null;
};

export { githubCollaborator };
