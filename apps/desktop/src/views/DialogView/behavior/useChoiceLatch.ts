/* @layer renderer-hud @kind hook */
import { useRef } from 'react';
import type { DialogFrame, DialogWait } from '@rotp/game-data';

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
