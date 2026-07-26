/* @layer renderer-lib @kind logic */
/**
 * Assembles the full debug-info block. `system` is null on any host without a main
 * process (web, mobile) — the host sections simply drop out and the renderer-side
 * ones still carry the report.
 */
import type { SystemDiagnostics } from '@shared/types/diagnostics';
import type { RendererDiagnostics } from '../types';
import { renderSections } from './section';
import { hardwareSection, systemSection } from './host-system';
import { graphicsSection } from './graphics';
import { displaysSection, windowSection } from './displays';
import { audioSection, inputSection, processSection } from './renderer-env';

interface DebugTextInput {
  /** Leading identity lines (app version, runtime, engine, platform) owned by the caller. */
  header: string[];
  system: SystemDiagnostics | null;
  renderer: RendererDiagnostics;
  userAgent: string;
}

const buildDebugText = ({ header, system, renderer, userAgent }: DebugTextInput): string => {
  const body = renderSections([
    ...(system ? [systemSection(system), hardwareSection(system)] : []),
    graphicsSection(system?.gpu ?? null, renderer.webgl),
    ...(system && system.displays.length > 0 ? [displaysSection(system.displays)] : []),
    windowSection(renderer.display),
    audioSection(renderer.audio),
    inputSection(renderer.device),
    processSection(renderer.device),
  ]);
  return [header.join('\n'), body, `[User agent]\n${userAgent}`].join('\n\n');
};

export { buildDebugText };
export type { DebugTextInput };
