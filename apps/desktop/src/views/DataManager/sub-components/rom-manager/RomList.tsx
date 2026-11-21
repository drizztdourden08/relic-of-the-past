/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Status, Icon, IconButton, EmptyState, Stack } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { ROM_KINDS } from '@rotp/roms';
import { formatBytes } from '@drizztdourden08/brock-core';
import { ExtractionMeta } from './ExtractionMeta';
import type { RomListProps } from './RomList.type';

const RomList = (props: RomListProps) => {
  const t = useT();
  const text = useText();
  const { romStatuses, supplements, selected, onSelect, onDelete } = props;
  const isEmpty = romStatuses.length === 0 && supplements.length === 0;

  return (
    <Stack gap="xs">
      {isEmpty && <EmptyState message={t('data-manager:rom-manager.empty')} />}
      {romStatuses.map((rom) => (
        <ListItemRow
          key={rom.romFile}
          icon={<Icon name="gamepad-2" />}
          name={<>{rom.romFile} <Status tone="neutral">{text(ROM_KINDS['snes-alttp'].label)}</Status></>}
          selected={selected === rom.romFile}
          onClick={() => onSelect(rom.romFile)}
          meta={<ExtractionMeta rom={rom} />}
          action={
            <IconButton variant="ghost" size="sm" label={t('data-manager:rom-manager.delete')} onClick={(e) => { e.stopPropagation(); onDelete(rom.romFile); }}>
              <Icon name="x" />
            </IconButton>
          }
        />
      ))}
      {supplements.map((supplement) => (
        <ListItemRow
          key={supplement.romFile}
          icon={<Icon name="puzzle" />}
          name={<>{supplement.romFile} <Status tone="neutral">{text(ROM_KINDS[supplement.kind].label)}</Status></>}
          selected={selected === supplement.romFile}
          onClick={() => onSelect(supplement.romFile)}
          meta={
            <>
              {supplement.attachedTo.length > 0
                ? <Status tone="success">{t('data-manager:rom-manager.attached', { count: supplement.attachedTo.length })}</Status>
                : <Status tone="warning">{t('data-manager:rom-manager.not-attached')}</Status>}
              {supplement.bytes ? ` · ${formatBytes(supplement.bytes)}` : ''}
            </>
          }
          action={
            <IconButton variant="ghost" size="sm" label={t('data-manager:rom-manager.delete')} onClick={(e) => { e.stopPropagation(); onDelete(supplement.romFile); }}>
              <Icon name="x" />
            </IconButton>
          }
        />
      ))}
    </Stack>
  );
};

export { RomList };
