/* @layer shared-hud @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { HudNode } from '../types/hud-node';

interface HudPreset {
  id: string;
  name: Message;
  icon: string;
  template: HudNode;
}

export type { HudPreset };
