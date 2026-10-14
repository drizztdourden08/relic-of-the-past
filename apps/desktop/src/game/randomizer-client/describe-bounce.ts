/* @layer bridge-wasm @kind logic */
import type { BounceDescription } from './describe-bounce.type';

const describeBounce = (data: Record<string, unknown> | undefined): BounceDescription => {
  const { source, cause } = data ?? {};
  return {
    source,
    name: typeof source === 'string' && source ? source : 'Someone',
    why: typeof cause === 'string' ? cause : '',
  };
};

export { describeBounce };
