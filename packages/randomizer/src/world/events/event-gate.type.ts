/* @layer shared-game @kind types */
import type { CheckId } from '@rotp/game-data';
import type { Rule } from '../world.type';

type ActToken = CheckId;

interface EventGate {
  checkId: CheckId;
  precondition?: Rule;
}

export type { ActToken, EventGate };
