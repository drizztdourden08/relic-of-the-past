/* @layer renderer-components @kind component */
/**
 * One variable in the insert list. Its own component so the click handler is
 * bound once per row rather than rebuilt inline on every keystroke in the filter
 * above it.
 *
 * A row the engine owns is offered like any other and carries a small padlock.
 * The game supplying the value means there is nothing to translate, not that a
 * line cannot reference it — the player's name is the commonest insert of all.
 */
import { useCallback } from 'react';
import { Icon as SymbolIcon } from '@iconify/react/offline';
import lockIcon from '@iconify-icons/lucide/lock';
import { Button, Text } from '@ds/primitives';
import type { Variable } from '@shared/game/language';

type VariableChoiceProps = {
  variable: Variable;
  onPick: (variable: Variable) => void;
};

const LOCK_PX = 11;

const VariableChoice = (props: VariableChoiceProps) => {
  const { variable, onPick } = props;

  const handleClick = useCallback(() => onPick(variable), [onPick, variable]);

  return (
    <Button
      className="variable-popover__row"
      variant="tertiary"
      size="sm"
      title={variable.note ?? variable.key}
      onClick={handleClick}
    >
      <Text as="span" className="variable-popover__row-label">{variable.label}</Text>
      {variable.locked ? (
        <SymbolIcon
          className="variable-popover__row-lock"
          icon={lockIcon}
          width={LOCK_PX}
          height={LOCK_PX}
          aria-hidden="true"
        />
      ) : null}
    </Button>
  );
};

export { VariableChoice };
export type { VariableChoiceProps };
