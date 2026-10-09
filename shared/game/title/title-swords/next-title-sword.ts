/* @layer shared-game @kind logic */
import type { TitleSword } from './title-swords.type';
import { TITLE_SWORDS } from './title-swords.constants';

const nextTitleSword = (current: TitleSword): TitleSword => {
  const at = TITLE_SWORDS.findIndex((s) => s.id === current);
  return TITLE_SWORDS[(at + 1) % TITLE_SWORDS.length].id;
};

export { nextTitleSword };
