/* @layer renderer-components @kind types */
interface ShopPriceModifierRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled: boolean;
  readout?: boolean;
  onChange?: (next: number) => void;
}

export type { ShopPriceModifierRowProps };
