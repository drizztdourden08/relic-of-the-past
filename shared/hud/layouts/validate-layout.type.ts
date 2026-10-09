/* @layer shared-hud @kind types */
import type { HudLayout } from '../../types/hud/hud-layout';

interface ValidationResult {
  doc: HudLayout | null;
  errors: string[];
  warnings: string[];
}

export type { ValidationResult };
