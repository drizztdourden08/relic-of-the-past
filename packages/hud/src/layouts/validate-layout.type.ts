/* @layer shared-hud @kind types */
import type { ReflowWarning } from './validate-motion-warnings';
import type { HudClusterReveal, HudLayout } from '../types/hud-layout';

interface ValidationResult {
  doc: HudLayout | null;
  errors: string[];
  warnings: ReflowWarning[];
}

interface LayoutHeader {
  id: string;
  name: string;
  reveal: HudClusterReveal | undefined;
}

export type { LayoutHeader, ValidationResult };
