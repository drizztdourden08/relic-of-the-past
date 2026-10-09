/* @layer hub-core @kind types */
import type { Group } from '../../../shared/hub';

type GroupWithCounts = Group & { memberCount: number; manualCount: number };

export type { GroupWithCounts };
