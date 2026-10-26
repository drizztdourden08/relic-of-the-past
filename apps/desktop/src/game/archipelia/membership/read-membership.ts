/* @layer bridge-wasm @kind logic */
import { readConfig } from '@app/storage/profile-store';
import { MEMBERSHIP_KEY } from './membership.constants';
import type { ArchipeliaMembership } from './membership.type';

const isMembership = (value: unknown): value is ArchipeliaMembership =>
  typeof value === 'object' && value !== null && 'state' in value && 'server' in value && 'code' in value;

const readMembership = async (profileId: string): Promise<ArchipeliaMembership | null> => {
  const stored = (await readConfig(profileId))?.[MEMBERSHIP_KEY];
  return isMembership(stored) ? stored : null;
};

export { readMembership };
