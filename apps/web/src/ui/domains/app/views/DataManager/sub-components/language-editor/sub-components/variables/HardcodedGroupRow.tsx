/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Checkbox, Text } from '@ds/primitives';
import { caseMissNote } from '../../behavior/hardcoded-report';
import type { HardcodedGroupRowProps } from './HardcodedGroupRow.type';

const HardcodedGroupRow = (props: HardcodedGroupRowProps) => {
  const { group, checked, onToggle } = props;
  const applicable = group.exact.length;

  const handleToggle = useCallback((next: boolean) => {
    onToggle(group.variableKey, next);
  }, [group.variableKey, onToggle]);

  const note = caseMissNote(group.caseMisses);

  return (
    <Box className="hardcoded-row">
      <Checkbox
        checked={checked}
        disabled={applicable === 0}
        label={group.label}
        onChange={handleToggle}
      />
      <Text as="span" className="hardcoded-row__phrase">{`"${group.text}"`}</Text>
      <Text as="span" className="hardcoded-row__count">
        {`${applicable} in ${group.entryCount} ${group.entryCount === 1 ? 'entry' : 'entries'}`}
      </Text>
      {group.exists ? null : (
        <Text as="span" className="hardcoded-row__new">variable not in this set yet</Text>
      )}
      {note ? <Text as="span" className="hardcoded-row__misses">{note}</Text> : null}
    </Box>
  );
};

export { HardcodedGroupRow };
