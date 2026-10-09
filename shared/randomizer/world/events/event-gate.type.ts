/* @layer shared-game @kind types */
import type { CheckId } from '@shared/game/data/types';
import type { Rule } from '../world.type';

type ActToken = CheckId;

interface EventGate {
  checkId: CheckId;
  precondition?: Rule;
}

export type { ActToken, EventGate };
