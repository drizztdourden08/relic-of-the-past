/* @layer renderer-components @kind types */
import type { HudNode } from '@shared/types/hud';

interface IdentitySectionProps {
  node: HudNode;
  breadcrumb: readonly string[];
  otherIds: readonly string[];
  onPatch: (patch: Partial<HudNode>) => void;
}

export type { IdentitySectionProps };
