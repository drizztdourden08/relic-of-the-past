/* @layer store-api @kind logic */
import { homeCacheSlot } from './home-cache-slot';

const invalidateHome = (): void => {
  homeCacheSlot.entry = null;
};

export { invalidateHome };
