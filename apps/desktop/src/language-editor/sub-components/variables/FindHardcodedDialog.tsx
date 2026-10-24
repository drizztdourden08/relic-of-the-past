/* @layer renderer-components @kind component */
import { useCallback, useMemo, useState } from 'react';
import { Box, Button, EmptyState, Text } from '@drizztdourden08/tessera/primitives';
import { DialogShell } from '@drizztdourden08/tessera/composites';
import { HardcodedGroupRow } from './HardcodedGroupRow';
import { NOTHING_FOUND } from './FindHardcodedDialog.constants';
import type { FindHardcodedDialogProps } from './FindHardcodedDialog.type';
import './FindHardcodedDialog.css';

const FindHardcodedDialog = (props: FindHardcodedDialogProps) => {
  const { open, groups, onApply, onClose } = props;

  const [chosen, setChosen] = useState<ReadonlySet<string>>(() => new Set<string>());

  const handleToggle = useCallback((variableKey: string, checked: boolean) => {
    setChosen((current) => {
      const next = new Set(current);
      if (checked) next.add(variableKey);
      else next.delete(variableKey);
      return next;
    });
  }, []);

  const total = useMemo(
    () => groups
      .filter((group) => chosen.has(group.variableKey))
      .reduce((sum, group) => sum + group.exact.length, 0),
    [groups, chosen],
  );

  const handleApply = useCallback(() => {
    onApply([...chosen]);
    setChosen(new Set<string>());
  }, [chosen, onApply]);

  const actions = (
    <>
      <Button variant="tertiary" onClick={onClose}>Close</Button>
      <Button variant="primary" disabled={total === 0} onClick={handleApply}>
        {total === 0 ? 'Retag' : `Retag ${total}`}
      </Button>
    </>
  );

  return (
    <DialogShell open={open} onClose={onClose} title="Find hardcoded names" actions={actions}>
      {groups.length === 0 ? (
        <EmptyState message={NOTHING_FOUND} />
      ) : (
        <Box className="hardcoded-dialog">
          <Text as="p" variant="caption" className="hardcoded-dialog__lead">
            Each name below is written out as plain text. Retagging makes those lines reference
            the variable, so a later rename reaches all of them.
          </Text>
          <Box className="hardcoded-dialog__rows">
            {groups.map((group) => (
              <HardcodedGroupRow
                key={group.variableKey}
                group={group}
                checked={chosen.has(group.variableKey)}
                onToggle={handleToggle}
              />
            ))}
          </Box>
        </Box>
      )}
    </DialogShell>
  );
};

export { FindHardcodedDialog };
