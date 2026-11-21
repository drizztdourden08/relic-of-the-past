/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Checkbox, Text } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import { caseMissNote } from '../../behavior/hardcoded-report';
import type { HardcodedGroupRowProps } from './HardcodedGroupRow.type';

const HardcodedGroupRow = (props: HardcodedGroupRowProps) => {
  const { group, checked, onToggle } = props;
  const t = useT();
  const applicable = group.exact.length;

  const handleToggle = useCallback((next: boolean) => {
    onToggle(group.variableKey, next);
  }, [group.variableKey, onToggle]);

  const note = caseMissNote(t, group.caseMisses);

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
        {t('language-editor:hardcoded.count', { applicable, entries: group.entryCount })}
      </Text>
      {group.exists ? null : (
        <Text as="span" className="hardcoded-row__new">{t('language-editor:hardcoded.new-variable')}</Text>
      )}
      {note ? <Text as="span" className="hardcoded-row__misses">{note}</Text> : null}
    </Box>
  );
};

export { HardcodedGroupRow };
