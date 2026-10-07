/* @layer renderer-hud @kind hook */
/**
 * The wait a message is on, held through a choice redraw. Moving the cursor makes the engine load the
 * menu's other message and retype it into the same box, so for a few frames it reports typing and no
 * choice. Once a box has asked for a choice it keeps asking until a new box starts or it parks on a
 * plain next or close wait, which is what the prompts and the skip rule need to see.
 */
import { useRef } from 'react';
import type { DialogFrame, DialogWait } from '@shared/game/dialog/dialog-frame.types';

const isChoice = (wait: DialogWait): boolean => wait === 'choice' || wait === 'item';

const useChoiceLatch = (frame: DialogFrame): DialogWait => {
  const { active, generation, wait } = frame;
  const latchRef = useRef<{ generation: number; wait: DialogWait } | null>(null);
  const latch = latchRef.current;
  if (!active || wait === 'key' || wait === 'end' || (latch && latch.generation !== generation)) latchRef.current = null;
  if (active && isChoice(wait)) latchRef.current = { generation, wait };
  return latchRef.current?.wait ?? wait;
};

export { useChoiceLatch };
