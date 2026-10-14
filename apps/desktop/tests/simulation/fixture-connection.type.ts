/* @layer tests @kind type */
import type { ConnectionRecord } from '@rotp/game-data';

type FixtureConnection = Omit<ConnectionRecord, 'screenId' | 'tags'> & {
  screenId: string;
  tags: readonly string[];
};

export type { FixtureConnection };
