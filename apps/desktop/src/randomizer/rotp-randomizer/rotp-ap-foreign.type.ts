/* @layer renderer-app @kind types */
import type { SessionStartHooks } from '@rotp/randomizer';

type ForeignHooks = Pick<SessionStartHooks, 'foreignItemOf' | 'foreignIconIdOf'>;

export type { ForeignHooks };
