/* @layer shared-store @kind constants */
import { incomingKey } from './incoming-key';
import { mediaKey } from './media-key';
import { packKey } from './pack-key';

const STORE_KEYS = {
  incoming: incomingKey,
  pack: packKey,
  media: mediaKey,
};

export { STORE_KEYS };
