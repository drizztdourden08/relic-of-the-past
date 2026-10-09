/* @layer shared-game @kind logic */
import type { RecorderState } from './recorder.type';

const createRecorder = (): RecorderState => ({ checks: [], transitions: [], doorGates: [] });

export { createRecorder };
