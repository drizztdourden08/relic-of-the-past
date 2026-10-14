/* @layer renderer-lib @kind logic */
import type { SaveSlotRef, SaveStore } from '@drizztdourden08/brock-port-kit';
import { createRotpSaveStore } from '../save-files';
import { platformFiles } from '../platform-files';

const store = (): SaveStore => createRotpSaveStore(platformFiles());

const quickRef = (slot: number): SaveSlotRef => ({ kind: 'quick', slot });

const portSaveStore = { store, quickRef };

export { portSaveStore };
