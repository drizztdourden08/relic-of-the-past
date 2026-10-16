/* @layer renderer-appshell @kind logic */
import type { DeleteProfileFlowDeps } from './useProfileManagement.type';

const successorOf = (profiles: Profile[], doomed: Profile): Profile | undefined =>
  profiles.find((candidate) => candidate.id !== doomed.id);

const runDeleteProfile = async (doomed: Profile, deps: DeleteProfileFlowDeps): Promise<void> => {
  const { profiles, activeProfile, stopGame, selectProfile, removeConfirmed } = deps;
  if (activeProfile?.id === doomed.id) {
    await stopGame();
    const successor = successorOf(profiles, doomed);
    if (successor) await selectProfile(successor);
  }
  removeConfirmed(doomed);
};

export { runDeleteProfile };
