/* @layer shared-types @kind types */
import type { OptimizeProgress } from '@shared/types/msu-optimize';

interface ImportProgress {
  kind: 'rom' | 'msu' | 'language' | 'sprite' | 'linkSprite';
  id: string;
  phase: 'download' | 'extract' | 'copy' | 'decode' | 'done' | 'error';
  loaded?: number;
  total?: number;
  message?: string;
}

interface EventContract {
  'window:maximized': (maximized: boolean) => void;
  'window:fullscreen': (fullscreen: boolean) => void;
  'log:entry': (entry: { channel: string; level: string; message: string }) => void;

  'import:progress': (progress: ImportProgress) => void;

  'msu:optimize:progress': (progress: OptimizeProgress) => void;
}

export type { EventContract, ImportProgress };
