/* @layer renderer-lib @kind logic */
import type { ImportProgressListener } from './import-progress-bus.type';

const progressListeners = new Set<ImportProgressListener>();

export { progressListeners };
