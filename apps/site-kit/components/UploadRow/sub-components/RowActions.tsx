/* @layer site-kit @kind component */
import type { MouseEvent } from 'react';
import { Button } from '@ds/primitives/Button';
import { DropZone } from '@ds/primitives/DropZone';
import { Flex } from '@ds/primitives/Flex';
import { IconButton } from '@ds/primitives/IconButton';
import { CANCELLABLE } from './RowActions.constants';
import type { RowActionsProps } from './RowActions.type';

const stay = (event: MouseEvent) => event.stopPropagation();

const RowActions = (props: RowActionsProps) => {
  const { job, onCancel, onDismiss, onPickFile } = props;
  const { id, phase } = job;
  const over = phase === 'done' || phase === 'failed';
  if (over) {
    return (
      <IconButton variant="ghost" size="sm" label="Dismiss" className="upload-row__dismiss" onClick={(event) => { stay(event); onDismiss(id); }}>
        {'×'}
      </IconButton>
    );
  }
  if (!CANCELLABLE.has(phase)) return null;
  return (
    <Flex align="stretch" justify="end" gap="sm" wrap className="upload-row__actions" onClick={stay}>
      <Button variant="ghost" size="sm" onClick={() => onCancel(id)}>Cancel</Button>
      {phase === 'needs-file' && (
        <DropZone variant="inline" label="Pick the file" onDrop={(files) => files[0] && onPickFile(id, files[0])} />
      )}
    </Flex>
  );
};

export { RowActions };
