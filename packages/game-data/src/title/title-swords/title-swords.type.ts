/* @layer shared-game @kind types */
import type { SwordTier } from '../title-frame.type';

type TitleSwordPicture = SwordTier;
type TitleSword = 'progress' | TitleSwordPicture;

export type { TitleSword, TitleSwordPicture };
