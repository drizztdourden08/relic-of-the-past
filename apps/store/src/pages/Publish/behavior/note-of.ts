/* @layer store-site @kind logic */
import type { StoreItem } from '@rotp/hub-contracts';
import { isInFlight } from '@rotp/hub-contracts';
import { FIELD_MESSAGES } from '../Publish.constants';
import type { PublishMode } from '../Publish.type';

const noteOf = (mode: PublishMode, item: StoreItem | null): string | null =>
  mode === 'version' && item?.versions.some(isInFlight) ? FIELD_MESSAGES.inFlight : null;

export { noteOf };
