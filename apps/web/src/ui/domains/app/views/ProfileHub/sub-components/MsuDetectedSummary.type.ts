/* @layer renderer-components @kind types */
import type { MsuPackProfile, ResolvedAudioConfig } from '@shared/features/msu-auto-config';

interface MsuDetectedSummaryProps {
  pack: MsuPackProfile | null;
  resolved: ResolvedAudioConfig;
}

interface MsuMismatchCalloutProps {
  message: string;
}

interface MsuImportProps {
  profileId: string;
}

interface MsuImportStatus {
  message: string;
  variant: '' | 'error' | 'success';
}

export type { MsuDetectedSummaryProps, MsuImportProps, MsuImportStatus, MsuMismatchCalloutProps };
