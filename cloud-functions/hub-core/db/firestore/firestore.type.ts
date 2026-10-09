/* @layer hub-core @kind types */
import type { HUB_COLLECTIONS } from './firestore.constants';

type HubCollection = keyof typeof HUB_COLLECTIONS;

export type { HubCollection };
