/* @layer hub-core @kind types */
import type { Group, HubUser, Rights, SiteAccess } from '@rotp/hub-contracts';
import type { Caller } from './require-caller';

type Member = { caller: Caller; user: HubUser; access: SiteAccess; groups: Group[]; rights: Rights };

export type { Member };
