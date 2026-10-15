/* @layer renderer-components @kind component */
import { Box, Checkbox, Text } from '@drizztdourden08/tessera/primitives';
import { OptionValueTag } from '../../OptionValueTag';
import type { BottleContentRowProps } from '../CurrencyPriceRow.type';
import './BottleContentRow.css';

const BottleContentRow = (props: BottleContentRowProps) => {
  const { row, disabled, readout = false, onChange } = props;
  const { label, checked, blocked, note } = row;

  return (
    <Box className="bottle-content-row" data-blocked={blocked ? '' : undefined}>
      {readout ? <OptionValueTag label={label} value={checked} /> : (
        <Checkbox
          label={label}
          checked={checked}
          disabled={disabled || blocked || onChange === undefined}
          onChange={(next) => onChange?.(next)}
        />
      )}
      {note !== '' && <Text className="bottle-content-row__note">{note}</Text>}
    </Box>
  );
};

export { BottleContentRow };
