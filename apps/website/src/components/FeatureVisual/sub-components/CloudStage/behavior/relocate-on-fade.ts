/* @layer website-site @kind logic */
import type { AnimationEvent } from 'react';
import { REDUCED_MOTION_QUERY } from '../CloudStage.constants';

const relocateOnFade = (event: AnimationEvent<HTMLElement>, relocate: (word: string) => void): void => {
  if (event.animationName !== 'cloud-fade' || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
  const word = (event.target as HTMLElement).closest('li')?.dataset.word;
  if (word) relocate(word);
};

export { relocateOnFade };
