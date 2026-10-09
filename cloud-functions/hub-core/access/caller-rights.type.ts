/* @layer hub-core @kind types */
import type { Group, Rights } from '@rotp/hub-contracts';

type CallerRights = { groups: Group[]; rights: Rights };

export type { CallerRights };
