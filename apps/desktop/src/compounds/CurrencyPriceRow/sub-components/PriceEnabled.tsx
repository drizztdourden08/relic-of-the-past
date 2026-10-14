/* @layer renderer-components @kind component */
import { Checkbox } from '@drizztdourden08/tessera/primitives';
import { OptionValueTag } from '../../OptionValueTag';
import type { PriceEnabledProps } from '../CurrencyPriceRow.type';

const PriceEnabled = ({ label, enabled, readout, disabled, onChange }: PriceEnabledProps) => {
  if (readout) return <OptionValueTag label={label} value={enabled} />;
  return <Checkbox checked={enabled} disabled={disabled} onChange={(next) => onChange?.(next)} label={label} />;
};

export { PriceEnabled };
