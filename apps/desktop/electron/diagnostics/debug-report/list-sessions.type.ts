/* @layer electron-main @kind types */
import type { DebugCaptureSessionSummary } from '@shared/types/debug-report';

type PreviewInfo = Pick<DebugCaptureSessionSummary, 'previewUrl' | 'previewFrameUrls' | 'previewKind'>;

export type { PreviewInfo };
