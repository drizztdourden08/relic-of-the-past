/* @layer renderer-components @kind component */
/**
 * One variable: its key, what kind it is, its value, how many entries use it,
 * and whether the value is the translator's to change.
 *
 * LOCKED means the game owns the value, not that the variable is unavailable.
 * The engine substitutes a save file's name field and one digit of a live
 * counter itself, so there is nothing to translate — but a line may still
 * reference either, and the picker still offers both. So the row shows the note
 * instead of a field, marks itself locked, and stays exactly as insertable as
 * every other row. Hiding it would only make a translator wonder where the
 * player's name went.
 */
import { useCallback } from 'react';
import { Badge, Box, IconButton, Text, TextInput } from '@ds/primitives';
import { KIND_WORDS } from './variable-groups';
import type { ChangeEvent } from 'react';
import type { Variable } from '@shared/game/language';

type VariableRowProps = {
  variable: Variable;
  /** Entries that reference this key. */
  used: number;
  onChangeValue: (variable: Variable, value: string) => void;
  /** Absent for a row that cannot be removed (engine-owned, or a menu slot). */
  onRemove?: (key: string) => void;
};

const VariableRow = (props: VariableRowProps) => {
  const { variable, used, onChangeValue, onRemove } = props;

  const handleValue = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onChangeValue(variable, event.currentTarget.value);
  }, [variable, onChangeValue]);

  const handleRemove = useCallback(() => onRemove?.(variable.key), [variable.key, onRemove]);

  return (
    <Box className="variable-row">
      <Text as="span" className="variable-row__key">{variable.key}</Text>
      <Badge variant="neutral" className="variable-row__kind">{KIND_WORDS[variable.kind]}</Badge>

      {variable.locked ? (
        <Text as="span" className="variable-row__note">
          {variable.note ?? 'the running game supplies this value'}
        </Text>
      ) : (
        <TextInput
          className="variable-row__value"
          value={variable.value ?? ''}
          onChange={handleValue}
        />
      )}

      <Text as="span" className="variable-row__used" title={`${used} entries reference this`}>
        {`${used}×`}
      </Text>

      {variable.locked ? (
        <Badge variant="warning" className="variable-row__locked">locked</Badge>
      ) : (
        <Box className="variable-row__locked" />
      )}

      {onRemove && !variable.locked ? (
        <IconButton
          variant="danger"
          size="sm"
          label={`Remove ${variable.key}`}
          onClick={handleRemove}
        >
          ✕
        </IconButton>
      ) : (
        <Box className="variable-row__spacer" />
      )}
    </Box>
  );
};

export { VariableRow };
export type { VariableRowProps };
