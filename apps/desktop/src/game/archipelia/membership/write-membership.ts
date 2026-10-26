/* @layer bridge-wasm @kind logic */
import { readConfig, writeConfig } from '@app/storage/profile-store';
import { MEMBERSHIP_KEY } from './membership.constants';
import type { ArchipeliaMembership } from './membership.type';

const writeMembership = async (profileId: string, membership: ArchipeliaMembership | null): Promise<void> => {
  const { [MEMBERSHIP_KEY]: _old, ...rest } = (await readConfig(profileId)) ?? {};
  await writeConfig(profileId, membership === null ? rest : { ...rest, [MEMBERSHIP_KEY]: membership });
};

export { writeMembership };
