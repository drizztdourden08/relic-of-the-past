/* @layer store-api @kind types */
import type { Rights } from '../../../../../shared/hub/group-types';

type Viewer = { caller: { userId: string }; rights: Rights };

export type { Viewer };
