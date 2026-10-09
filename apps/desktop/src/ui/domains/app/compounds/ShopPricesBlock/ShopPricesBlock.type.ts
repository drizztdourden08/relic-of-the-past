/* @layer renderer-components @kind types */
import type { CapacityProfile } from '@shared/randomizer/world/capacity';
import type { OptionValue } from '@shared/randomizer/world/options.type';

interface ShopPricesBlockProps {
  values: Readonly<Record<string, OptionValue>>;
  capacity: CapacityProfile;
  onChange?: (patch: Readonly<Record<string, OptionValue>>) => void;
  readout?: boolean;
}

export type { ShopPricesBlockProps };
