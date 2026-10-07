/* @layer sanctuary-site @kind logic */
/** The Sanctuary's saved views: keys `sanctuary:<surface>` over its two list surfaces. */
import { SANCTUARY_VIEW_SURFACES } from '@shared/sanctuary/view-surfaces';
import { createViewKeys } from '@site-kit/views/create-view-keys';
import { createViewStorage } from '@site-kit/views/create-view-storage';

const SANCTUARY_VIEW_KEYS = createViewKeys('sanctuary', SANCTUARY_VIEW_SURFACES);

const SANCTUARY_VIEWS = createViewStorage(SANCTUARY_VIEW_KEYS);

export { SANCTUARY_VIEW_KEYS, SANCTUARY_VIEWS };
