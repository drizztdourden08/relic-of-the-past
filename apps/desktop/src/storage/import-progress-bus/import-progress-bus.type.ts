/* @layer renderer-lib @kind types */
import type { ImportProgress } from '@app/ipc';

type ImportProgressListener = (progress: ImportProgress) => void;

export type { ImportProgressListener };
