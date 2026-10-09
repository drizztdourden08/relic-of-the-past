/* @layer shared-game @kind types */
import type { CheckRecord } from '@shared/game/data';

type CheckScope = NonNullable<CheckRecord['scope']>;

export type { CheckScope };
