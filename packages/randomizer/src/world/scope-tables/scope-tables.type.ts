/* @layer shared-game @kind types */
import type { CheckRecord } from '@rotp/game-data';

type CheckScope = NonNullable<CheckRecord['scope']>;

export type { CheckScope };
