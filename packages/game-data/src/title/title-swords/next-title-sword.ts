/* @layer shared-game @kind logic */
import type { TitleSword } from './title-swords.type';
import { TITLE_SWORDS } from './title-swords.constants';

const nextTitleSword = (current: TitleSword): TitleSword => {
  const at = TITLE_SWORDS.findIndex((s) => s.id === current);
  const next = TITLE_SWORDS[(at + 1) % TITLE_SWORDS.length];
  if (next === undefined) throw new Error('the title sword list is empty');
  return next.id;
};

export { nextTitleSword };
