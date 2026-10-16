/* @layer shared-types @kind types */
import type { ShadowCastingProject, ScreenShadowData } from '@rotp/game-core';
import type { SimRunConfig } from '@rotp/navigation';
import type { DebugCaptureFinalizeInput, DebugCaptureFinalizeResult } from '@app/debug-report';
import type { EntityKind } from '@rotp/game-data';
import type { PassResult, Recommendation, RecommendationPassRequest } from '../recommendation-contract.type';
import type { InvokeResult } from './invoke-result.type';

interface DevToolsInvokeContract {
  'recommendations:load': (kind: EntityKind) => Promise<readonly Recommendation[]>;
  'recommendations:applyPass': (pass: RecommendationPassRequest) => Promise<PassResult>;
  'recommendations:decide': (kind: EntityKind, id: string,
    state: 'accepted' | 'dismissed') => Promise<readonly Recommendation[]>;

  'test:getArgs': () => Promise<{ autoState: number | string | null; screenshot: string | null }>;

  'debug:getDumpLayersSlot': () => Promise<number | null>;
  'debug:getHoverTile': () => Promise<{ col: number; row: number } | null>;
  'debug:dumpLayers': (data: unknown) => Promise<string>;
  'debug:getDumpNavSlot': () => Promise<number | string | null>;
  'debug:dumpNav': (data: unknown) => Promise<string>;
  'debug:getSimRunConfig': () => Promise<SimRunConfig | null>;
  'debug:writeSimRun': (data: unknown) => Promise<string>;

  'sim:appendLog': (args: { runId: string; line: string }) => Promise<InvokeResult>;
  'sim:openLog': (args: { runId: string }) => Promise<InvokeResult>;

  'shadow-casting:load': () => Promise<ShadowCastingProject>;
  'shadow-casting:save': (data: ShadowCastingProject) => Promise<{ success: boolean }>;
  'shadow-casting:get-screen': (screenId: number) => Promise<ScreenShadowData | null>;

  'debug-capture:finalizeSession': (input: DebugCaptureFinalizeInput) => Promise<DebugCaptureFinalizeResult>;
}

export type { DevToolsInvokeContract };
