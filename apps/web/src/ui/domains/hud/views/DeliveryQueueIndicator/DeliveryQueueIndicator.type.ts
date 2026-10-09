/* @layer renderer-hud @kind types */
import type { DeliveryEntry } from '../../../../../lib/game/delivery-queue';

interface QueueEntryProps {
  entry: DeliveryEntry;
  isActive: boolean;
}

export type { QueueEntryProps };
