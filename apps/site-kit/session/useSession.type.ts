/* @layer site-kit @kind types */
import type { Identity } from '@shared/hub/types';
import type { SiteUser } from '@shared/hub/site-types';
import type { Group, Rights } from '@shared/hub/group-types';

type SessionState = {
  me: SiteUser | null;
  identities: Identity[];
  groups: Group[];
  rights: Rights | null;
  loading: boolean;
  error: string | null;
};

export type { SessionState };
