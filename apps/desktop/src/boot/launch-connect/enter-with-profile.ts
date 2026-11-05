/* @layer renderer-app @kind logic */
import { isLiveMembership, isSameLobby, readMembership, resumeMembership } from '@drizztdourden08/brock-randomizer/renderer';
import type { ArchipeliaMembership } from '@drizztdourden08/brock-randomizer/renderer';
import { log } from '@app/log-bus';
import { checkedLobby } from './checked-lobby';
import { joinWithProfile } from './join-with-profile';
import { refuseLobbyJoin as refuse } from './refuse-lobby-join';

const resumeWithProfile = async (profile: Profile, membership: ArchipeliaMembership): Promise<Profile> => {
  await resumeMembership(profile);
  log.app(`[LaunchConnect] Profile "${profile.name}" resumes its membership of lobby "${membership.lobbyName}" (${membership.state.kind})`);
  return profile;
};

const holdsOtherLobby = (profile: Profile, membership: ArchipeliaMembership): boolean =>
  profile.randomizer?.mode !== 'archipelia' || isLiveMembership(membership);

const enterWithProfile = async (profile: Profile, server: string, code: string): Promise<Profile | null> => {
  const membership = await readMembership(profile.id);
  if (membership !== null && isSameLobby(membership, server, { code })) return resumeWithProfile(profile, membership);
  if (membership !== null && holdsOtherLobby(profile, membership)) {
    return refuse(`profile "${profile.name}" belongs to lobby ${membership.lobby.code ?? membership.lobbyName} on ${membership.server}, not ${code}; name another profile with --profile-name`);
  }
  const check = await checkedLobby(server, code);
  return check === null ? null : joinWithProfile(profile, check);
};

export { enterWithProfile };
