/* @layer renderer-components @kind logic */
import { lobbyWatch, writeMembership } from '@drizztdourden08/brock-randomizer/renderer';
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import { saveRandomizerPlacement } from '@app/randomizer-placement-io';
import { updateProfile } from '@app/storage/profile-store';
import { rollPlacement } from '@app/randomizer/roll/roll-placement';

const localConfigOf = ({ seed, options, frozenSettings }: ProfileRandomizerConfig): ProfileRandomizerConfig => ({
  mode: 'local',
  seed,
  options,
  ...(frozenSettings === undefined ? {} : { frozenSettings }),
});

const convertToLocal = async (profile: Profile): Promise<void> => {
  if (profile.randomizer === undefined) return;
  const local = localConfigOf(profile.randomizer);
  await saveRandomizerPlacement(profile.id, rollPlacement(local));
  await updateProfile(profile.id, { randomizer: local });
  await writeMembership(profile.id, null);
  lobbyWatch.forget(profile.id);
};

export { convertToLocal };
