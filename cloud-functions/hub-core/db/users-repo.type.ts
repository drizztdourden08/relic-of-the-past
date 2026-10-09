/* @layer hub-core @kind types */
import type { AccessCheck, HubUser } from '@rotp/hub-contracts';

type SignUpProfile = { handle: string; avatarUrl: string | null };
type UserSummary = { userId: string; displayName: string };
type StoredUser = Omit<HubUser, 'groupIds' | 'roleGroupIds' | 'sites'> &
  Partial<Pick<HubUser, 'groupIds' | 'roleGroupIds' | 'sites'>> & { access?: AccessCheck };

export type { SignUpProfile, UserSummary, StoredUser };
