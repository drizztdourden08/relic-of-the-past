/* @layer site-kit @kind types */
import type { Identity } from '@rotp/hub-contracts';
import type { SiteAccess, SiteUser } from '@rotp/hub-contracts';
import type { Group, Rights } from '@rotp/hub-contracts';

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
