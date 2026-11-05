/* @layer renderer-app @kind logic */
import { RANDOMIZER_RECEIPT_MSG } from '@rotp/asset-extraction';
import { isFromServer, isQuietReceiptItem, renderFromServer, renderOnline, resolveServerItemLocalId } from '@rotp/randomizer';
import type { DeliveryAction } from '@rotp/randomizer';
import type { ArchipelagoGame } from '@drizztdourden08/brock-randomizer';
import { isGrantable } from '@app/game/delivery-api/is-grantable';
import { appendSessionReceiptMessage, releaseSessionReceiptMessage } from '@app/game/session-dialogue';

const rotpApReceivedAction: ArchipelagoGame<unknown, DeliveryAction>['receivedAction'] = (item) => {
  const localId = resolveServerItemLocalId(item.itemName);
  if (localId === undefined || !isGrantable(localId)) return null;
  const line = isFromServer(item) ? renderFromServer(item.itemName) : renderOnline(item.senderName, item.itemName);
  let arrival: number | null = null;
  const messageOf = (): number => {
    arrival ??= appendSessionReceiptMessage(line);
    return arrival ?? RANDOMIZER_RECEIPT_MSG.online;
  };
  const give: DeliveryAction = { type: 'give_item', itemId: localId, receiptExport: true, messageOf };
  return {
    message: item.itemName,
    action: isQuietReceiptItem(localId) ? { type: 'quiet_receipt', itemId: localId, fallback: give } : give,
    onComplete: () => {
      if (arrival !== null) releaseSessionReceiptMessage(arrival);
      arrival = null;
    },
  };
};

export { rotpApReceivedAction };
