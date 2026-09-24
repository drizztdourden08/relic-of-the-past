/* @layer shared-game @kind data */
/**
 * The swords the title can plant, in the order the setting steps through them: the save's own pick,
 * then one per tier. The fighter's tier draws the game's own sword until its picture exists; the
 * other three are efracraft's.
 */
import type { SwordTier } from './title-frame.type';

type TitleSwordPicture = SwordTier;
type TitleSword = 'progress' | TitleSwordPicture;

const TITLE_SWORDS: readonly { id: TitleSword; label: string }[] = [
  { id: 'progress', label: 'Progress' },
  { id: 'fighter', label: 'Fighter' },
  { id: 'master', label: 'Master' },
  { id: 'tempered', label: 'Tempered' },
  { id: 'golden', label: 'Golden' },
];

const titleSwordLabel = (id: TitleSword): string => TITLE_SWORDS.find((s) => s.id === id)?.label ?? id;

/** The next sword in the order, wrapping to the first. */
const nextTitleSword = (current: TitleSword): TitleSword => {
  const at = TITLE_SWORDS.findIndex((s) => s.id === current);
  return TITLE_SWORDS[(at + 1) % TITLE_SWORDS.length].id;
};

const resolveTitleSword = (choice: TitleSword, tier: SwordTier): TitleSwordPicture => (choice === 'progress' ? tier : choice);

export { nextTitleSword, resolveTitleSword, TITLE_SWORDS, titleSwordLabel };
export type { TitleSword, TitleSwordPicture };
