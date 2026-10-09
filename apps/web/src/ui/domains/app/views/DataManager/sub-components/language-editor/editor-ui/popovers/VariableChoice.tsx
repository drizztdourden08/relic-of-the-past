/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Icon as SymbolIcon } from '@iconify/react/offline';
import lockIcon from '@iconify-icons/lucide/lock';
import { Button, Text } from '@ds/primitives';
import { LOCK_PX } from './VariableChoice.constants';
import type { VariableChoiceProps } from './VariableChoice.type';

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
