/* @layer root-config @kind types */
import type { AccessSource, Identity, Provider } from '../../../../shared/sanctuary';
import type { GrantDoc } from '../db/grants-repo';

/** A provider token that only exists inside the callback that received it. */
type FreshToken = { provider: Provider; accessToken: string };

type AccessContext = {
  userId: string;
  identities: Identity[];
  grant: GrantDoc | null;
  fresh: FreshToken | null;
};

/** Answers with the source that grants access, or null to pass to the next rule. */
type AccessRule = (ctx: AccessContext) => Promise<AccessSource | null>;

export type { FreshToken, AccessContext, AccessRule };
