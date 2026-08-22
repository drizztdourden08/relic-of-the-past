/* @layer renderer-components @kind component */
/**
 * One value in a parameter picker. Its own component purely so the click
 * handler can be bound once per value instead of rebuilt inline on every render
 * of the list around it.
 */
import { useCallback } from 'react';
import { Button, Text } from '@ds/primitives';
import type { InsertChoice } from '../sub-components/insert-menu.types';

type ParamChoiceProps = {
  choice: InsertChoice;
  onPick: (value: string) => void;
};

const ParamChoice = (props: ParamChoiceProps) => {
  const { choice, onPick } = props;

  const handleClick = useCallback(() => onPick(choice.value), [onPick, choice.value]);

  return (
    <Button
      className="param-picker__choice"
      variant="tertiary"
      size="sm"
      role="menuitem"
      title={choice.hint}
      onClick={handleClick}
    >
      <Text as="span" className="param-picker__choice-label">{choice.label}</Text>
      {choice.hint ? (
        <Text as="span" className="param-picker__choice-hint">{choice.hint}</Text>
      ) : null}
    </Button>
  );
};

export { ParamChoice };
export type { ParamChoiceProps };
