/* @layer bridge-wasm @kind constants */
import type { PondId } from '@shared/randomizer/world/pond/pond-instance.type';
import type { PondDemandMessagesOf } from './receipt-text-refresh';

const NO_DEMAND_MESSAGES: PondDemandMessagesOf = () => ({ askMessageId: -1, refuseMessageId: -1, awardMessageId: -1 });

const POND_DEMAND_KEY: Readonly<Record<PondId, number>> = { capacity: 0, wishing: 1, cursed: 2 };

export { NO_DEMAND_MESSAGES, POND_DEMAND_KEY };
