/* @layer store-site @kind logic */
/**
 * Where the browser loads a card or a banner from. The bucket is private, so the API signs a
 * short-lived link onto every picture it hands out; a reference without one draws the kind's
 * icon instead. Every picture on the site goes through this one function.
 */
import type { MediaRef } from '@shared/store/types';

const mediaUrl = (ref: MediaRef | null): string | null => ref?.url ?? null;

export { mediaUrl };
