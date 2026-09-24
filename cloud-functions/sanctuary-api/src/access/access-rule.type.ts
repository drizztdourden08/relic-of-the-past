/* @layer root-config @kind types */
import type { Group, Identity, Provider, SanctuaryUser } from '../../../../shared/sanctuary';
import type { GrantDoc } from '../db/grants-repo';

/** A provider token that only exists inside the callback that received it. */
type FreshToken = { provider: Provider; accessToken: string };

type AccessContext = {
  user: SanctuaryUser;
  identities: Identity[];
  grant: GrantDoc | null;
  /** Every group, read fresh for this run. */
  groups: Group[];
  fresh: FreshToken | null;
};

/** Answers whether the user is on the admin list. */
type AdminRule = (ctx: AccessContext) => Promise<boolean>;

/** Answers the ids of the groups this source puts the user in; an empty list passes. */
type GroupRule = (ctx: AccessContext) => Promise<string[]>;

export type { FreshToken, AccessContext, AdminRule, GroupRule };
