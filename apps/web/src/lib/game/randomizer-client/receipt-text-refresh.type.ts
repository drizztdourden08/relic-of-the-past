/* @layer bridge-wasm @kind types */
import type { CapacityFixedLineArm } from '../capacity-fixed-lines';
import type { MessageIdOf } from './apply-overrides';
import type { RungMessageIdOf } from './capacity-rung-messages';

interface PondMessageIds {
  priceMessageOf: (price: number) => number;
  refundMessageOf: (refund: number) => number;
  awardMoreMessageId: number;
  awardLastMessageId: number;
  closedMessageId: number;
}

interface PondDemandMessageIds {
  askMessageId: number;
  refuseMessageId: number;
  awardMessageId: number;
}

type PondDemandMessagesOf = (pond: number, rung: number) => PondDemandMessageIds;

interface WishPondMessageIds {
  awardMessageId: number;
  closedMessageId: number;
}

interface SessionReceiptTexts {
  composed: boolean;
  messageIdOf: MessageIdOf;
  rungMessageIdOf: RungMessageIdOf;
  fixedLineMessages: readonly CapacityFixedLineArm[];
  pondMessages: PondMessageIds;
  wishPondMessages: WishPondMessageIds;
  pondDemandMessagesOf: PondDemandMessagesOf;
  stop: () => void;
}

export type { PondDemandMessageIds, PondDemandMessagesOf, PondMessageIds, SessionReceiptTexts, WishPondMessageIds };
