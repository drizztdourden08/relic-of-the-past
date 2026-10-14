/* @layer bridge-wasm @kind types */
import type { OnlineContext } from '@rotp/randomizer';

type ScoutOutcome = Awaited<ReturnType<OnlineContext['core']['armScouted']>>;

export type { ScoutOutcome };
