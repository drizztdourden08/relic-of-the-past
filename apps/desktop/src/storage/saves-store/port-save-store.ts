/* @layer renderer-lib @kind logic */
import { createSaveStore } from '@drizztdourden08/brock-port-kit';
import type { SaveSlotRef, SaveStore } from '@drizztdourden08/brock-port-kit';
import { platformFiles } from '../platform-files';

const store = (): SaveStore => createSaveStore(platformFiles());

const quickRef = (slot: number): SaveSlotRef => ({ kind: 'quick', slot });

const portSaveStore = { store, quickRef };

export { portSaveStore };
