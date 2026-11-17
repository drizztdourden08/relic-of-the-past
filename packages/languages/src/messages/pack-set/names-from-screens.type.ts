/* @layer shared-game @kind types */
import type { PauseTable } from '@rotp/asset-extraction';

type ItemSlot = { table: PauseTable; entry: number; key: string };

export type { ItemSlot };
