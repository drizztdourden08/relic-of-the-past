/* @layer shared-hud @kind types */
import type { HudElementSpec } from '../types/hud-node';
import type { NodeContext } from './validate-container';

type SpecReader = (value: Record<string, unknown>, path: string, ctx: NodeContext) => HudElementSpec | null;

export type { SpecReader };
