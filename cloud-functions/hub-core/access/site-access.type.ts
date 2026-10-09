/* @layer hub-core @kind types */
import type { SiteAccess } from '@rotp/hub-contracts';

type SiteAccessResult = { access: SiteAccess; roleGroupIds: string[] };

export type { SiteAccessResult };
