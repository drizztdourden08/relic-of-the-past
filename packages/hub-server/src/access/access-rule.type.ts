/* @layer hub-core @kind types */
import type { Group, Identity, Provider, HubUser } from '@rotp/hub-contracts';
import type { GrantDoc } from '../db/grants-repo.type';

type FreshToken = { provider: Provider; accessToken: string };

type AccessContext = {
  user: HubUser;
  identities: Identity[];
  grant: GrantDoc | null;
  groups: Group[];
  fresh: FreshToken | null;
};

type AdminRule = (ctx: AccessContext) => Promise<boolean>;

type GroupRule = (ctx: AccessContext) => Promise<string[]>;

export type { FreshToken, AccessContext, AdminRule, GroupRule };
