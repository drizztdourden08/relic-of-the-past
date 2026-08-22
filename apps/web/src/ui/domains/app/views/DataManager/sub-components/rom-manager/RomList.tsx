/* @layer renderer-components @kind component */
/**
 * Combined ROM list: base cartridges (with their extraction status, as before)
 * and supplement cartridges (with attachment status instead — a supplement has
 * no extraction affordance of its own, only a sidecar per attached base).
 */
import { Badge } from '@ds/primitives/Badge';
import { Box } from '@ds/primitives/Box';
import { IconButton } from '@ds/primitives/IconButton';
import { EmptyState } from '@ds/primitives/EmptyState';
import { ListItemRow } from '@ds/composites/ListItemRow';
import { ROM_KINDS } from '@shared/storage/rom-kinds';
import type { SupplementStatus } from '@shared/storage/roms';
import { formatBytes } from '@app/utils/formatBytes';

interface RomListProps {
  romStatuses: RomDisplayInfo[];
  supplements: SupplementStatus[];
  selected: string | null;
  onSelect: (romFile: string) => void;
  onDelete: (romFile: string) => void;
}

const RomList = (props: RomListProps) => {
  const { romStatuses, supplements, selected, onSelect, onDelete } = props;
  const isEmpty = romStatuses.length === 0 && supplements.length === 0;

  return (
    <Box className="data-list">
      {isEmpty && <EmptyState message="No ROMs imported yet" />}
      {romStatuses.map((rom) => (
        <ListItemRow
          key={rom.romFile}
          icon="🎮"
          name={<>{rom.romFile} <Badge variant="neutral">{ROM_KINDS['snes-alttp'].label}</Badge></>}
          selected={selected === rom.romFile}
          onClick={() => onSelect(rom.romFile)}
          meta={
            <>
              {rom.extractionStatus === 'ready' ? '✓ Assets extracted' :
               rom.extractionStatus === 'extracting' ? '⟳ Extracting…' :
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
          name={<>{supplement.romFile} <Badge variant="neutral">{ROM_KINDS[supplement.kind].label}</Badge></>}
          selected={selected === supplement.romFile}
          onClick={() => onSelect(supplement.romFile)}
          meta={
            <>
              {supplement.attachedTo.length > 0
                ? <Badge variant="success">{`Attached to ${supplement.attachedTo.length}`}</Badge>
                : <Badge variant="warning">Not attached</Badge>}
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
    </Box>
  );
};

export { RomList };
export type { RomListProps };
