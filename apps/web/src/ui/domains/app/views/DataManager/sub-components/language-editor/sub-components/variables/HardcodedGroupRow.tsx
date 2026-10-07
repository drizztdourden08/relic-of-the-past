/* @layer renderer-components @kind component */
/**
 * One variable's worth of the hardcoded-name scan: the phrase, how many lines
 * spell it out, and a tick to retag them all.
 *
 * The near-miss count sits on the row, not in a footnote, because it
 * belongs to this phrase and to no other. Those matched only with case ignored,
 * so they are never retagged, because a reference would recase a line someone
 * wrote that way. Saying so per row is what keeps the applied total honest.
 *
 * A row with nothing applicable still appears, with its tick disabled: "nothing
 * to do here, and here is why" is an answer.
 */
import { useCallback } from 'react';
import { Box, Checkbox, Text } from '@ds/primitives';
import { caseMissNote } from '../../behavior/hardcoded-report';
import type { HardcodedGroup } from '../../behavior/hardcoded-report';

type HardcodedGroupRowProps = {
  group: HardcodedGroup;
  checked: boolean;
  onToggle: (variableKey: string, checked: boolean) => void;
};

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
export type { HardcodedGroupRowProps };
