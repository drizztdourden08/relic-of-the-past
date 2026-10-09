/* @layer electron-main @kind types */
type ImportSource =
  | { kind: 'path'; path: string }
  | { kind: 'url'; url: string };

interface ResolvedSource {
  files: string[];
  extractedArchive: boolean;
  downloadedPath: string | null;
  cleanup: () => Promise<void>;
}

type SourceProgress = (stage: { phase: 'download' | 'extract'; loaded?: number; total?: number }) => void;

export type { ImportSource, ResolvedSource, SourceProgress };
