/* @layer renderer-app @kind logic */
import type { ShowContext } from '@drizztdourden08/brock-react';
import { isExperimental } from './is-experimental';

const isOnlineExperimental = (ctx: ShowContext): boolean =>
  isExperimental(ctx) && ctx.profile?.randomizer?.mode === 'online';

export { isOnlineExperimental };
