/* @layer shared-types @kind types */
import type { ShadowCastingProject, ScreenShadowData } from '@rotp/game-core';
import type { SimRunConfig } from '@rotp/navigation';
import type {
  DebugCaptureFinalizeInput, DebugCaptureFinalizeResult,
  DebugCaptureSessionSummary, DebugCaptureDeleteSessionResult,
} from '@shared/types/debug-report';
import type { EntityKind } from '@rotp/game-data';
import type { UiViewsMap } from '../ui-views-contract.type';
import type { DetectionContext, DraftRecommendation, PassResult, Recommendation } from '../recommendation-contract.type';
import type { InvokeResult, ReviewMap } from './invoke-result.type';

interface DevToolsInvokeContract {
  'spriteDebug:load': () => Promise<ReviewMap>;
  'spriteDebug:save': (data: ReviewMap) => Promise<void>;
  'spriteReview:load': () => Promise<ReviewMap>;
  'spriteReview:save': (data: ReviewMap) => Promise<void>;
  'connectionReview:load': () => Promise<unknown>;
  'connectionReview:save': (data: unknown) => Promise<void>;
  'navReview:load': () => Promise<unknown>;
  'navReview:save': (data: unknown) => Promise<void>;

  'uiViews:load': () => Promise<UiViewsMap>;
  'uiViews:save': (data: UiViewsMap) => Promise<void>;

  'recommendations:load': (kind: EntityKind) => Promise<readonly Recommendation[]>;
  'recommendations:applyPass': (kind: EntityKind, context: DetectionContext,
    detectorIds: readonly string[], drafts: readonly DraftRecommendation[]) => Promise<PassResult>;
  'recommendations:decide': (kind: EntityKind, id: string,
    state: 'accepted' | 'dismissed') => Promise<readonly Recommendation[]>;

  'test:getArgs': () => Promise<{ autoState: number | string | null; screenshot: string | null }>;
  'test:finish': (screenshot: string) => Promise<string>;
  'test:screenshot': (name: string) => Promise<string>;

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
  'debug-capture:listSessions': (input: { profileId: string }) => Promise<DebugCaptureSessionSummary[]>;
  'debug-capture:deleteSession': (input: { profileId: string; sessionKey: string }) => Promise<DebugCaptureDeleteSessionResult>;}

export type { DevToolsInvokeContract };
