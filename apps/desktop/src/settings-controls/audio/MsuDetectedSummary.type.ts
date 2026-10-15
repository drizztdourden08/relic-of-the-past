/* @layer renderer-components @kind types */
import type { MsuPackProfile, ResolvedAudioConfig } from '@rotp/features';

interface MsuDetectedSummaryProps {
  pack: MsuPackProfile | null;
  resolved: ResolvedAudioConfig;
}

interface MsuMismatchCalloutProps {
  message: string;
}

export type { MsuDetectedSummaryProps, MsuMismatchCalloutProps };
