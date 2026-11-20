/* @layer renderer-lib @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';
type ImportKind = 'rom' | 'msu' | 'language' | 'sprite' | 'linkSprite';

type ImportPhase = 'download' | 'extract' | 'copy' | 'decode';

interface ImportReport {
  phase: (phase: ImportPhase, message?: Text) => void;
  count: (phase: ImportPhase, loaded: number, total?: number) => void;
}

interface ImportJobParams<Result> {
  kind: ImportKind;
  title: Text;
  work: (report: ImportReport) => Promise<Result>;
  failureOf?: (result: Result) => string | null;
}

export type { ImportJobParams, ImportKind, ImportPhase, ImportReport };
