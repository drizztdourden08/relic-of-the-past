/* @layer sanctuary-site @kind component */
/**
 * The side column's panel while two files or more are picked, in place of one file's
 * details: how many and how big, their tiles, and what can be done to all of them at
 * once. Download and Copy links take every file; the edits and Delete take only the
 * caller's own, and say beforehand which are skipped. Delete asks once.
 */
import { useMemo, useState } from 'react';
import type { FileType, SanctuaryFile } from '@shared/sanctuary/file-types';
import { Button } from '@ds/primitives/Button';
import { Card } from '@ds/primitives/Card';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { Dialog } from '@ds/composites/Dialog';
import { WindowHeader } from '@ds/composites/WindowHeader';
import { formatBytes } from '../../../lib/format-bytes';
import { splitByRight } from '../behavior/batch-edits';
import { totalBytes } from '../behavior/batch-size';
import type { BatchActions } from '../behavior/useBatchActions';
import type { BatchDownload } from '../behavior/useBatchDownload';
import { BatchDownloadBlock } from './BatchDownloadBlock';
import { BatchEditForm } from './BatchEditForm';
import { SelectionGrid } from './SelectionGrid';
import { SkipNote } from './SkipNote';

type SelectionPanelProps = {
  files: readonly SanctuaryFile[];
  /** The types the caller may move a file to. */
  types: readonly FileType[];
  knownTags: readonly string[];
  canEdit: (file: SanctuaryFile) => boolean;
  batch: BatchActions;
  download: BatchDownload;
  onClear: () => void;
};

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
export type { SelectionPanelProps };
