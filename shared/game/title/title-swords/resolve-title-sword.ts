/* @layer shared-game @kind logic */
import type { SwordTier } from '../title-frame.type';
import type { TitleSword, TitleSwordPicture } from './title-swords.type';

const resolveTitleSword = (choice: TitleSword, tier: SwordTier): TitleSwordPicture => (choice === 'progress' ? tier : choice);

export { resolveTitleSword };
