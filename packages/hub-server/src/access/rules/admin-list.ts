/* @layer hub-core @kind logic */
import { readHubEnv } from '../../env';
import type { AdminRule } from '../access-rule.type';

const adminList: AdminRule = ({ identities }) => {
  const admins = readHubEnv().SANCTUARY_ADMIN_IDS;
  return Promise.resolve(identities.some((identity) => admins.includes(identity.id)));
};

export { adminList };
