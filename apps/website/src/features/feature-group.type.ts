/* @layer website-site @kind types */
import type { Feature } from './feature.type';
import type { Screenshot } from './screenshot.type';

type FeatureCards = readonly [Feature, Feature, Feature] | readonly [Feature, Feature, Feature, Feature];

type FeatureGroup = {
  id: string;
  kicker: string;
  title: string;
  lead: string;
  backdrop: Screenshot;
  features: FeatureCards;
};

export type { FeatureCards, FeatureGroup };
