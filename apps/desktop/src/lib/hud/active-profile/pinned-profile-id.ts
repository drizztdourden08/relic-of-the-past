/* @layer renderer-lib @kind logic */
import { instanceProfile } from '@app/lib/instance';
import { listProfiles } from '@app/lib/storage/profile-store';

const pinnedProfileId = async (): Promise<string | null> => {
  const wanted = instanceProfile();
  if (!wanted) return null;
  const profiles = await listProfiles();
  return (profiles.find((p) => p.id === wanted) ?? profiles.find((p) => p.name === wanted))?.id ?? null;
};

export { pinnedProfileId };
