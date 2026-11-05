/* @layer bridge-wasm @kind logic */
import type { RandomizerSession } from '@drizztdourden08/brock-randomizer/session';
import type { ActiveSession } from './session-store.type';

const isActiveSession = (session: RandomizerSession | null): session is ActiveSession =>
  session?.kind === 'local' || session?.kind === 'online';

export { isActiveSession };
