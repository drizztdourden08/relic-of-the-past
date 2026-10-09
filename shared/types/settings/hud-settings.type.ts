/* @layer shared-types @kind types */
import type { TitleSword } from '../../game/title/title-swords';

interface HudSettings {
  hudMode: 'original' | 'enhanced';
  hudStyle: 'vanilla' | 'enhanced' | 'modern';
  hudRatio: 'match' | '4:3' | '3:2' | '16:9' | '16:10' | 'custom';
  customHudAspectW: number;
  customHudAspectH: number;
  hudEnhancedParts: ('main' | 'pause')[];
  hudHeartMode: 'original' | 'smooth';
  hudMagicMode: 'original' | 'accurate';
  hudCountLayout: 'centered' | 'original';
  hudCountdownStyle: 'pixel' | 'smooth';
  titleScreen: 'original' | 'reimagined';
  titleMotion: 'still' | 'drifting';
  titleFollowsProgress: boolean;
  titleSword: TitleSword;
}

export type { HudSettings };
