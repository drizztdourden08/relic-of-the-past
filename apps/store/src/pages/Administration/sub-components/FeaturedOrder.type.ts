/* @layer store-site @kind types */
import type { ItemCardView } from '@shared/store/home-types';
import type { HomeSettingsState } from '../behavior/useHomeSettings.type';

type FeaturedOrderProps = {
  settings: HomeSettingsState;
  catalog: readonly ItemCardView[];
};

export type { FeaturedOrderProps };
