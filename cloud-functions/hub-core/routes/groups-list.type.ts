/* @layer hub-core @kind types */
import type { Group } from '@rotp/hub-contracts';

type GroupWithCounts = Group & { memberCount: number; manualCount: number };

export type { GroupWithCounts };
