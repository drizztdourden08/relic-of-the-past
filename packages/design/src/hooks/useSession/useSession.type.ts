/* @layer site-kit @kind types */
import type { Identity, SiteUser, Group, Rights } from '@rotp/hub-contracts';

type SessionState = {
  me: SiteUser | null;
  identities: Identity[];
  groups: Group[];
  rights: Rights | null;
  loading: boolean;
  error: string | null;
};

export type { SessionState };
