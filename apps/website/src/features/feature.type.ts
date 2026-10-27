/* @layer website-site @kind types */
import type { FeatureVisual } from './feature-visual.type';

type Feature = {
  id: string;
  label: string;
  short: string;
  title: string;
  promise: readonly [string, string];
  body: string;
  settings: readonly string[];
  caption: string;
  visual: FeatureVisual;
  layout: 'split' | 'wide';
  tag?: 'experimental';
};

export type { Feature };
