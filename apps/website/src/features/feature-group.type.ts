/* @layer website-site @kind types */
import type { Feature } from './feature.type';

type GroupGlow = 'forest' | 'castle' | 'gold' | 'shop' | 'violet';

type FeatureGroup = {
  id: string;
  numeral: 'I' | 'II' | 'III' | 'IV' | 'V';
  short: string;
  kicker: string;
  title: string;
  accent: string;
  lead: string;
  glow: GroupGlow;
  features: readonly Feature[];
};

export type { FeatureGroup };
