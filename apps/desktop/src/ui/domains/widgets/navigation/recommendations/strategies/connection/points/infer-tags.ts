/* @layer renderer-widgets @kind logic */
import type { ConnectionTag } from '@rotp/game-data';
import type { ObservedTransition } from '@shared/game/recommendations';

const inferTags = (transition: ObservedTransition): ConnectionTag[] => {
  if (transition.source === 'stair') return ['transit:stairs', 'ctx:internal'];
  if (transition.source === 'hole') return ['transit:hole', 'ctx:entrance'];
  if (transition.source === 'travel') return ['transit:warp', 'ctx:internal'];
  if (transition.source === 'doorway') return ['transit:door', 'ctx:internal'];
  return ['transit:door', 'ctx:entrance'];
};

export { inferTags };
