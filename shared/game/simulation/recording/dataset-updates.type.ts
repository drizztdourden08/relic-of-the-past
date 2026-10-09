/* @layer shared-game @kind types */
import type { ConnectionRecord } from '../../data';

interface UpdateDeps {
  connections?: ConnectionRecord[];
}

export type { UpdateDeps };
