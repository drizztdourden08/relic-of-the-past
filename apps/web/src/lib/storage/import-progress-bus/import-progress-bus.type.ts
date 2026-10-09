/* @layer renderer-lib @kind types */
import type { ImportProgress } from '@shared/ipc';

type ImportProgressListener = (progress: ImportProgress) => void;

export type { ImportProgressListener };
