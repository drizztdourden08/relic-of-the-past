/* @layer renderer-components @kind logic */
import type { RefObject } from 'react';
import type { PreviewSession } from './preview-session.type';

const isCurrentSession = (sessionRef: RefObject<PreviewSession | null>, ctx: AudioContext): boolean =>
  sessionRef.current?.ctx === ctx;

export { isCurrentSession };
