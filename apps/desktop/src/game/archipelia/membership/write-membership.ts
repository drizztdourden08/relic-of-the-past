/* @layer bridge-wasm @kind logic */
import { updateConfig } from '@app/storage/profile-store';
import { MEMBERSHIP_KEY } from './membership.constants';
import type { ArchipeliaMembership } from './membership.type';

const withMembership = (config: Record<string, unknown>, membership: ArchipeliaMembership | null): Record<string, unknown> => {
  const { [MEMBERSHIP_KEY]: _old, ...rest } = config;
  return membership === null ? rest : { ...rest, [MEMBERSHIP_KEY]: membership };
};

const writeMembership = (profileId: string, membership: ArchipeliaMembership | null): Promise<void> =>
  updateConfig(profileId, (config) => withMembership(config, membership));

export { writeMembership };
