/* @layer renderer-hud @kind types */
import type { CSSProperties } from 'react';
import type { HudAnimation, HudBoxStyle, PlacedNode } from '@rotp/hud';

type MotionScope = Readonly<Record<string, number>>;

interface NodeAnimationInput {
  animations: readonly HudAnimation[] | undefined;
  nowMs: number;
  scope: MotionScope;
  reducedMotion: boolean;
  style: HudBoxStyle | undefined;
  displayScale: number;
}

interface SampledProperties {
  scale?: number; x?: number; y?: number; rotate?: number; opacity?: number; tint?: number;
  width?: number; height?: number;
}

interface NodeAnimationResult {
  css: CSSProperties;
  opacityMultiplier: number;
}

interface Ghost { placed: PlacedNode; removeAt: number }

interface EnterExitResult {
  renderNodes: readonly PlacedNode[];
  enterStyle: (id: string) => CSSProperties;
  exitStyle: (id: string) => CSSProperties;
  transitionCss: (id: string) => string | undefined;
}

interface HudNodeMotionResult {
  renderNodes: readonly PlacedNode[];
  styleFor: (placed: PlacedNode) => CSSProperties;
  opacityFor: (placed: PlacedNode) => number;
}

interface NodeSnapshot { w: number; h: number; x: number; y: number; opacity: number }

export type {
  EnterExitResult, Ghost, HudNodeMotionResult, MotionScope, NodeAnimationInput, NodeAnimationResult, NodeSnapshot,
  SampledProperties,
};
