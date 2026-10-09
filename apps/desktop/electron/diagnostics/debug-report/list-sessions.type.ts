/* @layer electron-main @kind types */
import type { DebugCaptureSessionSummary } from '@app/debug-report';

type PreviewInfo = Pick<DebugCaptureSessionSummary, 'previewUrl' | 'previewFrameUrls' | 'previewKind'>;

export type { PreviewInfo };
