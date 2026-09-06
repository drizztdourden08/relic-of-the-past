/* @layer renderer-components @kind component */
/**
 * One content a shelf may demand a bottle of: its tick and, when the potion
 * rule has taken that content out of the game, the short line saying so
 * right beside it. Two different reasons grey a tick here and they must not
 * read alike: the whole bottle row being off is a setting the player can undo
 * on the spot, while a blocked content is a consequence of the shop scope
 * above. Only the second carries a note.
 */
import { Box, Checkbox, Text } from '@ds/primitives';
import type { BottleContentRowModel } from '../behavior/bottle-content-rows';
import './BottleContentRow.css';

interface BottleContentRowProps {
  row: BottleContentRowModel;
  /** The bottle row itself is not ticked, or the whole section is frozen. */
  disabled: boolean;
  onChange?: (checked: boolean) => void;
}

const BottleContentRow = (props: BottleContentRowProps) => {
  const { row, disabled, onChange } = props;
  const { label, checked, blocked, note } = row;

  return (
    <Box className="bottle-content-row" data-blocked={blocked ? '' : undefined}>
      <Checkbox
        label={label}
        checked={checked}
        disabled={disabled || blocked || onChange === undefined}
        onChange={(next) => onChange?.(next)}
      />
      {note !== '' && <Text className="bottle-content-row__note">{note}</Text>}
    </Box>
  );
};

export { BottleContentRow };
export type { BottleContentRowProps };
