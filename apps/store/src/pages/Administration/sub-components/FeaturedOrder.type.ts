/* @layer store-site @kind types */
import type { ItemCardView } from '@rotp/hub-contracts';
import type { HomeSettingsState } from '../behavior/useHomeSettings.type';

type FeaturedOrderProps = {
  settings: HomeSettingsState;
  catalog: readonly ItemCardView[];
};

export type { FeaturedOrderProps };
