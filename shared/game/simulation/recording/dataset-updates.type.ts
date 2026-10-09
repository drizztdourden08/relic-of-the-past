/* @layer shared-game @kind types */
import type { ConnectionRecord } from '@rotp/game-data';

interface UpdateDeps {
  connections?: ConnectionRecord[];
}

export type { UpdateDeps };
