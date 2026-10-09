/* @layer renderer-components @kind types */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import type { MsuEngine } from '@app/lib/msu/engine';
import type { PreviewReport } from './preview-report-store.type';

type ReadReport = (engine: MsuEngine) => PreviewReport | null;

interface PreviewRun {
  manifest: MsuPackManifest;
  read: ReadReport;
  begin: (engine: MsuEngine) => void;
}

interface PreviewSession {
  ctx: AudioContext;
  engine: MsuEngine;
  read: ReadReport;
}

export type { ReadReport, PreviewRun, PreviewSession };
