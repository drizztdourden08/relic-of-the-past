/* @layer store-api @kind types */
import type { Rights } from '@rotp/hub-contracts';

type Viewer = { caller: { userId: string }; rights: Rights };

export type { Viewer };
