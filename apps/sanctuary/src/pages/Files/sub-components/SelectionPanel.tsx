/* @layer sanctuary-site @kind component */
import { useMemo, useState } from 'react';
import { Button } from '@ds/primitives/Button';
import { Card } from '@ds/primitives/Card';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { Dialog } from '@ds/composites/Dialog';
import { WindowHeader } from '@ds/composites/WindowHeader';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { splitByRight } from '../behavior/batch-edits';
import { totalBytes } from '../behavior/batch-size';
import { BatchDownloadBlock } from './BatchDownloadBlock';
import { BatchEditForm } from './BatchEditForm';
import { SelectionGrid } from './SelectionGrid';
import { SkipNote } from './SkipNote';
import type { SelectionPanelProps } from './SelectionPanel.type';

const deleteMessage = (count: number, skipped: number) => {
  const what = count === 1 ? '1 file' : `${count} files`;
  const rest = skipped > 0 ? ` The other ${skipped} are not yours and stay.` : '';
  return `Delete ${what} and every version of them? The objects are removed from the bucket.${rest}`;
};

const SelectionPanel = (props: SelectionPanelProps) => {
  const { files, types, knownTags, canEdit, batch, download, onClear } = props;
  const [confirming, setConfirming] = useState(false);
  const { mine, others } = useMemo(() => splitByRight(files, canEdit), [files, canEdit]);
  const suggestions = useMemo(
    () => [...new Set([...files.flatMap((file) => file.tags), ...knownTags])],
    [files, knownTags],
  );
  const { busy } = batch;

  const clear = <Button variant="ghost" size="sm" onClick={onClear}>Clear</Button>;

  return (
    <Card className="side-panel selection-panel">
      <Stack as="section" gap="md" align="stretch" aria-label="Selected files">
        <WindowHeader title={`${files.length} files selected`} extra={clear} className="selection-panel__head" />
        <SelectionGrid files={files} />
        <Text as="span" variant="caption" className="selection-panel__total">{formatBytes(totalBytes(files))} in all</Text>
        <BatchDownloadBlock files={files} download={download} busy={busy} onCopyLinks={() => void batch.copyLinks(files)} />
        <SkipNote skipped={others} total={files.length} />
        {mine.length > 0 && (
          <>
            <BatchEditForm
              types={types}
              knownTags={suggestions}
              busy={busy}
              onSetType={(type) => void batch.setType(files, type)}
              onAddTags={(tags) => void batch.addTags(files, tags)}
              onRemoveTags={(tags) => void batch.removeTags(files, tags)}
            />
            <Button variant="danger" size="sm" disabled={busy} onClick={() => setConfirming(true)} className="selection-panel__delete">
              Delete {mine.length === 1 ? '1 file' : `${mine.length} files`}
            </Button>
          </>
        )}
        {batch.notice && <Text as="p" variant="caption" role="status" className="selection-panel__note">{batch.notice}</Text>}
      </Stack>
      <Dialog
        open={confirming}
        title="Delete files"
        message={deleteMessage(mine.length, others.length)}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { setConfirming(false); void batch.remove(files); }}
        onCancel={() => setConfirming(false)}
      />
    </Card>
  );
};

export { SelectionPanel };
