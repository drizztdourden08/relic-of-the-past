/* @layer site-kit @kind types */
import type { Identity } from '@shared/hub/types';
import type { SiteAccess, SiteUser } from '@shared/hub/site-types';
import type { Group, Rights } from '@shared/hub/group-types';

type Session = {
  me: SiteUser | null;
  access: SiteAccess | null;
  identities: Identity[];
  groups: Group[];
  rights: Rights | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  signOut: (everywhere?: boolean) => Promise<void>;
};

export type { Session };
