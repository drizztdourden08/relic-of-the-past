/* @layer sanctuary-site @kind constants */
import { SANCTUARY_VIEW_SURFACES } from '@rotp/hub-contracts';
import { createViewKeys } from '@rotp/design';
import { createViewStorage } from '@rotp/design';

const SANCTUARY_VIEW_KEYS = createViewKeys('sanctuary', SANCTUARY_VIEW_SURFACES);

const SANCTUARY_VIEWS = createViewStorage(SANCTUARY_VIEW_KEYS);

export { SANCTUARY_VIEW_KEYS, SANCTUARY_VIEWS };
