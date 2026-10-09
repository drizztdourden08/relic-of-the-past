/* @layer renderer-lib @kind types */
import type { SystemDiagnostics } from '@shared/types/diagnostics';
import type { RendererDiagnostics } from '../diagnostics.type';

interface DebugTextInput {
  header: string[];
  system: SystemDiagnostics | null;
  renderer: RendererDiagnostics;
  userAgent: string;
}

export type { DebugTextInput };
