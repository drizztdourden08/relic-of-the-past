/* @layer hub-core @kind types */
import type { Group, Rights } from '../../../shared/hub';

type CallerRights = { groups: Group[]; rights: Rights };

export type { CallerRights };
