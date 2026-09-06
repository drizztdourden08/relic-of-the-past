/* @layer renderer-components @kind component */
/**
 * The pack as files, not slots. The drop zone and the format conversion live here because the
 * files are one shared pool that every slot and sound draws from.
 */
import { useCallback, useMemo, useState } from 'react';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { Box } from '@ds/primitives/Box';
import { Checkbox } from '@ds/primitives/Checkbox';
import { DropZone } from '@ds/primitives/DropZone';
import { EmptyState } from '@ds/primitives/EmptyState';
import { Field } from '@ds/primitives/Field';
import { SectionHeader } from '@ds/primitives/SectionHeader';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import { formatBytes } from '@app/utils/formatBytes';
import { FileRow } from './FileRow';
import { PackSummary } from './PackSummary';
import { OptimizeDialog } from './OptimizeDialog';
import { useFileAudition } from './behavior/useFileAudition';
import { useFilePanel } from './behavior/useFilePanel';
import { useFileUsage } from './behavior/useFileUsage';
import { useSupersededFiles } from './behavior/useSupersededFiles';
import { AUDIO_ACCEPT, AUDIO_ACCEPT_HINT } from './msu.constants';
import type { MsuFile } from './msu.type';

interface MsuFilePanelProps {
  pack: string;
  /** What the rows credit a file to: the pack's own manifest, or the classic view of its files. */
  manifest: MsuPackManifest;
  /** What a rename WRITES into. Null for a classic pack, which stays classic. */
  saveBase: MsuPackManifest | null;
  files: MsuFile[];
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onReload: () => void;
}

/** There is nothing to convert in a pack with no audio in it yet. */
const EMPTY_PACK = 'Add some audio to this pack first.';

/** Stable empty list, so a row with no uses is not handed a fresh array on every render. */
const NO_USES: string[] = [];

// Column headings in grid order; keep in step with the template that sizes them.
const COLUMNS = ['Name', 'Format', 'Size', 'Length', 'Rate', 'Repeats', 'Played by', ''];

const MsuFilePanel = (props: MsuFilePanelProps) => {
  const { pack, manifest, saveBase, files, onDeleteConfirm, onReload } = props;
  const panel = useFilePanel({ pack, files, saveBase, reload: onReload });
  const audition = useFileAudition(pack, files);
  const usage = useFileUsage(manifest);
  const covered = useSupersededFiles({ pack, files, saveBase, reload: onReload });
  const { metadata, rows, deleteFile, report } = panel;
  const [supersededOnly, setSupersededOnly] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const unusedCount = useMemo(
    () => metadata.filter((file) => !usage.has(file.name)).length,
    [metadata, usage],
  );

  const shown = useMemo(
    () => (supersededOnly ? rows.filter((file) => covered.superseded.has(file.name)) : rows),
    [rows, supersededOnly, covered.superseded],
  );

  // Deleting a file a slot still names leaves that slot silent, so the confirmation says which.
  const confirmDelete = useCallback((fileName: string) => {
    const uses = usage.get(fileName) ?? NO_USES;
    const played = uses.length > 0 ? ` ${uses.join(', ')} will be left with nothing to play.` : '';
    onDeleteConfirm(
      'Delete Audio File',
      `Delete "${fileName}" from this pack? This cannot be undone.${played}`,
      () => { deleteFile(fileName); },
    );
  }, [usage, onDeleteConfirm, deleteFile]);

  // These are normally orphans; one still named by a slot is re-pointed to its converted file first.
  const confirmRemoveSuperseded = useCallback(() => {
    const doomed = [...covered.superseded];
    const stillNamed = doomed.filter((name) => (usage.get(name) ?? NO_USES).length > 0);
    const played = stillNamed.length > 0
      ? ` ${stillNamed.length} of them ${stillNamed.length === 1 ? 'is' : 'are'} still named by a slot or sound, which will play the converted file instead.`
      : '';
    onDeleteConfirm(
      'Remove Superseded Originals',
      `Delete ${doomed.length} original file${doomed.length === 1 ? '' : 's'} the pack already holds in the`
      + ` converted format? This frees ${formatBytes(covered.totalBytes)} and cannot be undone.${played}`,
      () => { void covered.removeAll().then(report); },
    );
  }, [covered, usage, onDeleteConfirm, report]);

  return (
    <Box className="msu-panel">
      <SectionHeader
        title="Files"
        subtitle="Every audio file in the pack. Any slot or sound can draw on any of them, so a file is not owned by the row that plays it."
      />

      <PackSummary
        fileCount={metadata.length}
        totalSize={panel.totalSize}
        formats={panel.formats}
        unusedCount={unusedCount}
        supersededCount={covered.count}
        supersededBytes={covered.totalBytes}
        optimizeBlockedBecause={metadata.length === 0 ? EMPTY_PACK : null}
        busy={panel.busy || covered.removing}
        onOptimize={() => setOptimizing(true)}
        onRemoveSuperseded={confirmRemoveSuperseded}
      />

      <DropZone
        accept={AUDIO_ACCEPT}
        label="Drop audio here to add it to the pack"
        hint={AUDIO_ACCEPT_HINT}
        disabled={panel.busy}
        onDrop={panel.handleUpload}
      />

      <Field label="Find a file" hint="Matches the name, or a format on its own.">
        <TextInput
          type="text"
          placeholder="intro, pcm..."
          value={panel.filter}
          onChange={(event) => panel.setFilter(event.target.value)}
        />
      </Field>

      {covered.count > 0 && (
        <Checkbox
          checked={supersededOnly}
          label={`Superseded originals only (${covered.count})`}
          onChange={setSupersededOnly}
        />
      )}

      {panel.statusMessage != null && (
        <Text className={`msu-status${panel.statusOk ? '' : ' msu-status--error'}`}>
          {panel.statusMessage}
        </Text>
      )}

      {/* Nothing until the first metadata read settles: an empty state would claim the pack has no files. */}
      {!panel.ready ? null : shown.length === 0 ? (
        <EmptyState message={metadata.length === 0
          ? 'This pack has no audio yet. Drop some in above'
          : supersededOnly
            ? 'No superseded original matches this filter'
            : `No file matches "${panel.filter}"`}
        />
      ) : (
        <Box className="msu-file-grid">
          <Box className="msu-file-grid__head" aria-hidden>
            {COLUMNS.map((label, index) => (
              // The last column is the row's buttons, which need the width but not a heading.
              <Text key={label === '' ? `actions-${index}` : label} className="msu-file-grid__label">
                {label}
              </Text>
            ))}
          </Box>

          <Box className="msu-file-grid__body">
            {shown.map((file) => (
              <FileRow
                key={file.name}
                file={file}
                usedBy={usage.get(file.name) ?? NO_USES}
                loopSeconds={audition.loopOf(file.name)}
                playing={audition.playing === file.name}
                loading={audition.loading === file.name}
                audition={audition.playing === file.name ? audition.audition : null}
                busy={panel.busy}
                onPlay={audition.toggle}
                onRename={panel.renameFile}
                onDelete={confirmDelete}
              />
            ))}
          </Box>
        </Box>
      )}

      <OptimizeDialog
        open={optimizing}
        pack={pack}
        onClose={() => setOptimizing(false)}
        onConverted={onReload}
      />
    </Box>
  );
};

export { MsuFilePanel };
export type { MsuFilePanelProps };
