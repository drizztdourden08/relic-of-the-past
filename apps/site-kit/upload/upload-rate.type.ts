/* @layer site-kit @kind types */
import type { createRate } from './upload-rate';

type RateEstimate = { bytesPerSecond: number | null; msLeft: number | null };

type UploadRate = ReturnType<typeof createRate>;

export type { RateEstimate, UploadRate };
