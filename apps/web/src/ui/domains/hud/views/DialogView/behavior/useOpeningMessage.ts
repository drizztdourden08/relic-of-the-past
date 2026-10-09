/* @layer renderer-hud @kind hook */
import { useRef } from 'react';
import type { DialogFrame } from '@shared/game/dialog/dialog-frame.types';

const useOpeningMessage = (frame: DialogFrame): number => {
  const { generation, messageId } = frame;
  const openedRef = useRef({ generation, messageId });
  if (openedRef.current.generation !== generation) openedRef.current = { generation, messageId };
  return openedRef.current.messageId;
};

export { useOpeningMessage };
