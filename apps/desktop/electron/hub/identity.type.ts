/* @layer electron-main @kind types */
import type { Identity, SiteUser } from '@rotp/hub-contracts';

type MeResponse = { user: SiteUser; identities: Identity[]; via: 'session' | 'device'; deviceId: string | null };

export type { MeResponse };
