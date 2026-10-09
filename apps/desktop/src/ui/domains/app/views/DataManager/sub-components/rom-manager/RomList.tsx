/* @layer renderer-components @kind component */
import { Status, IconButton, EmptyState, Stack } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { ROM_KINDS } from '@shared/storage/rom-kinds';
import { formatBytes } from '@drizztdourden08/brock-core';
import type { RomListProps } from './RomList.type';

const RomList = (props: RomListProps) => {
  const { romStatuses, supplements, selected, onSelect, onDelete } = props;
  const isEmpty = romStatuses.length === 0 && supplements.length === 0;

  return (
    <Stack gap="xs">
      {isEmpty && <EmptyState message="No ROMs imported yet" />}
      {romStatuses.map((rom) => (
        <ListItemRow
          key={rom.romFile}
          icon="🎮"
          name={<>{rom.romFile} <Status tone="neutral">{ROM_KINDS['snes-alttp'].label}</Status></>}
          selected={selected === rom.romFile}
          onClick={() => onSelect(rom.romFile)}
          meta={
            <>
              {rom.extractionStatus === 'ready' ? '✓ Assets extracted' :
               rom.extractionStatus === 'extracting' ? '⟳ Extracting...' :
               rom.extractionStatus === 'failed' ? '✗ Extraction failed' :
               'No assets'}
              {rom.assetSize ? ` · ${formatBytes(rom.assetSize)}` : ''}
            </>
          }
          action={
            <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => { e.stopPropagation(); onDelete(rom.romFile); }}>
              ✕
            </IconButton>
          }
        />
      ))}
      {supplements.map((supplement) => (
        <ListItemRow
          key={supplement.romFile}
          icon="🧩"
          name={<>{supplement.romFile} <Status tone="neutral">{ROM_KINDS[supplement.kind].label}</Status></>}
          selected={selected === supplement.romFile}
          onClick={() => onSelect(supplement.romFile)}
          meta={
            <>
              {supplement.attachedTo.length > 0
                ? <Status tone="success">{`Attached to ${supplement.attachedTo.length}`}</Status>
                : <Status tone="warning">Not attached</Status>}
              {supplement.bytes ? ` · ${formatBytes(supplement.bytes)}` : ''}
            </>
          }
          action={
            <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => { e.stopPropagation(); onDelete(supplement.romFile); }}>
              ✕
            </IconButton>
          }
        />
      ))}
    </Stack>
  );
};

export { RomList };
