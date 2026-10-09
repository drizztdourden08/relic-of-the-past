/* @layer renderer-lib @kind types */
import type { SystemDiagnostics } from '@app/diagnostics-types';
import type { RendererDiagnostics } from '../diagnostics.type';

interface DebugTextInput {
  header: string[];
  system: SystemDiagnostics | null;
  renderer: RendererDiagnostics;
  userAgent: string;
}

export type { DebugTextInput };
