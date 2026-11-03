/* @layer renderer-app @kind types */
import type { LoadedScript } from '../input-script/input-script.type';

type AutoLaunch = { script: LoadedScript; profile: Profile };

type ConnectionVerdict = 'connected' | 'failed' | 'cancelled' | 'timed-out';

export type { AutoLaunch, ConnectionVerdict };
