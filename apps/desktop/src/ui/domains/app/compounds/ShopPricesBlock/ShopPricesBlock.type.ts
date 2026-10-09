/* @layer renderer-components @kind types */
import type { CapacityProfile } from '@rotp/randomizer';
import type { OptionValue } from '@rotp/randomizer';

interface ShopPricesBlockProps {
  values: Readonly<Record<string, OptionValue>>;
  capacity: CapacityProfile;
  onChange?: (patch: Readonly<Record<string, OptionValue>>) => void;
  readout?: boolean;
}

export type { ShopPricesBlockProps };
