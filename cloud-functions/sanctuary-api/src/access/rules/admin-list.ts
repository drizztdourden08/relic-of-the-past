/* @layer root-config @kind logic */
/** The env allowlist of `provider:subject` ids. Any linked identity on it makes
 *  the user an admin, whichever provider they signed in with first. */
import { readEnv } from '../../env';
import type { AdminRule } from '../access-rule.type';

const adminList: AdminRule = async ({ identities }) => {
  const admins = readEnv().SANCTUARY_ADMIN_IDS;
  return identities.some((identity) => admins.includes(identity.id));
};

export { adminList };
