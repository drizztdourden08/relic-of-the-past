/* @layer shared-hud @kind logic */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import { validateNode } from '../layouts/validate-node';
import type { HudPreset } from './presets.type';

const readPreset = (id: string, name: Message, icon: string, json: unknown): HudPreset => {
  const issues: string[] = [];
  const node = validateNode(json, `presets/${id}.json`, { issues, seen: new Set(), insideRepeat: false });
  if (!node) {
    throw new Error([`presets/${id}.json is not a valid HUD subtree:`, ...issues.map((e) => `  - ${e}`)].join('\n'));
  }
  return { id, name, icon, template: node };
};

export { readPreset };
