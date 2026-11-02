/* @layer renderer-app @kind logic */
import type { LobbyJoin } from '@app/launch-flags/lobby-join/lobby-join.type';
import { checkedLobby } from './checked-lobby';
import { createLobbyProfile } from './create-lobby-profile';
import { enterWithProfile } from './enter-with-profile';
import { pickLaunchProfile } from './pick-launch-profile';
import { refuseLobbyJoin as refuse } from './refuse-lobby-join';
import { waitForRoom } from './wait-for-room';

const createForLobby = async (active: Profile, name: string, server: string, code: string): Promise<Profile | null> => {
  const check = await checkedLobby(server, code);
  return check === null ? null : createLobbyProfile(active, name, check);
};

const joinLobbyAtLaunch = async (active: Profile, lobby: LobbyJoin, explicitName: string | null): Promise<Profile | null> => {
  const { server, code } = lobby;
  if (code === null) return refuse('the lobby code is missing (--lobby-join=<host>[:<port>]:<code>)');
  const pick = await pickLaunchProfile(active, 'archipelia', explicitName, `RotP-${code.slice(0, 4)}`);
  if (pick.kind === 'refuse') return refuse(pick.why);
  const profile = pick.kind === 'create'
    ? await createForLobby(active, pick.name, server, code)
    : await enterWithProfile(pick.profile, server, code);
  if (profile === null) return null;
  return (await waitForRoom(profile.id)) ? profile : refuse('the lobby room did not open');
};

export { joinLobbyAtLaunch };
