/* @layer bridge-wasm @kind types */
import type { SessionStatus } from '@drizztdourden08/brock-randomizer/session';

type SessionStatusListener = (status: SessionStatus) => void;

export type { SessionStatusListener };
