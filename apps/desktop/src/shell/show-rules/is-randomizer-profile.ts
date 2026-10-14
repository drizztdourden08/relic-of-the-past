/* @layer renderer-app @kind logic */
import type { ShowContext } from '@drizztdourden08/brock-react';
import { runKindOfProfile } from '../../game/randomizer-client/run-kind/run-kind-of-profile';

const isRandomizerProfile = (ctx: ShowContext): boolean => runKindOfProfile(ctx.profile?.randomizer) !== 'normal';

export { isRandomizerProfile };
