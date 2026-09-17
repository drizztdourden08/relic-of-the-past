/* @layer renderer-hud @kind hook */
/**
 * The message a box opened with. A menu that redraws on a cursor move loads other messages into the
 * same box, so the id on screen stops naming the menu; the one it started with still does.
 */
import { useRef } from 'react';
import type { DialogFrame } from '@shared/game/dialog/dialog-frame.types';

const useOpeningMessage = (frame: DialogFrame): number => {
  const { generation, messageId } = frame;
  const openedRef = useRef({ generation, messageId });
  if (openedRef.current.generation !== generation) openedRef.current = { generation, messageId };
  return openedRef.current.messageId;
};

export { useOpeningMessage };
