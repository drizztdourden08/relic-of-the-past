/* @layer website-site @kind types */
import type { FeatureVisual } from './feature-visual.type';

type PlatformLogo = 'windows' | 'linux' | 'macos' | 'android';

type SettingTag = string | { label: string; logo: PlatformLogo };

type FeatureTag = 'experimental' | 'in-progress' | 'in-development';

type Feature = {
  id: string;
  label: string;
  short: string;
  title: string;
  promise: readonly [string, string];
  body: string;
  settings: readonly SettingTag[];
  caption: string;
  visual: FeatureVisual;
  layout: 'split' | 'wide';
  tag?: FeatureTag;
};

export type { Feature, FeatureTag, PlatformLogo, SettingTag };
