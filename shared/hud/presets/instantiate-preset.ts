/* @layer shared-hud @kind logic */
import { presetById } from './preset-by-id';
import { rekey } from './rekey';
import type { HudNode } from '../../types/hud/hud-node';

const instantiatePreset = (id: string): HudNode | null => {
  const preset = presetById(id);
  return preset ? rekey(preset.template) : null;
};

export { instantiatePreset };
