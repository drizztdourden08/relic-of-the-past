/* @layer renderer-components @kind component */
// "Standard"/"Extended" matches the audio settings wording; "Layered"/"Classic" is whether a manifest exists.
import { useEffect, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { ButtonRow } from '@ds/primitives/ButtonRow';
import { Flex } from '@ds/primitives/Flex';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import { formatBytes } from '@app/utils/formatBytes';
import type { ExportFormat } from './behavior/usePackExport';
import type { PackFormat } from './msu.type';

interface MsuPackHeaderProps {
  pack: string;
  format: PackFormat;
  slotCount: number;
  fileCount: number;
  totalSize: number;
  isDeluxe: boolean;
  hasOpuz: boolean;
  busy: boolean;
  exporting: ExportFormat | null;
  onRename: (name: string) => void;
  onExport: (format: ExportFormat) => void;
}

const MsuPackHeader = (props: MsuPackHeaderProps) => {
  const { pack, format, slotCount, fileCount, totalSize, isDeluxe, hasOpuz, busy, exporting, onRename, onExport } = props;
  const [draftName, setDraftName] = useState(pack);

  useEffect(() => { setDraftName(pack); }, [pack]);
  const renameReady = draftName.trim().length > 0 && draftName.trim() !== pack;

  return (
    <Box className="msu-pack-header">
      <Flex gap="sm" align="center" className="msu-pack-header__name">
        <TextInput
          type="text"
          value={draftName}
          aria-label="Pack name"
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && renameReady && !busy) onRename(draftName); }}
        />
        <Button variant="secondary" size="sm" disabled={busy || !renameReady} onClick={() => onRename(draftName)}>
          Rename
        </Button>
      </Flex>

      <Box className="detail-panel__grid">
        <Text className="detail-panel__label">Slots</Text>
        <Text className="detail-panel__value">{slotCount}</Text>
        <Text className="detail-panel__label">Files</Text>
        <Text className="detail-panel__value">{fileCount} · {formatBytes(totalSize)}</Text>
        <Text className="detail-panel__label">Type</Text>
        <Text className="detail-panel__value">
          {isDeluxe ? 'Extended' : 'Standard'} · {format === 'layered' ? 'Layered' : 'Classic'}
          {hasOpuz ? ' · needs conversion' : ''}
        </Text>
      </Box>

      <ButtonRow align="start">
        <Button variant="secondary" size="sm" disabled={busy} onClick={() => onExport('msul')}>
          {exporting === 'msul' ? 'Exporting...' : 'Export .msul'}
        </Button>
        <Button variant="tertiary" size="sm" disabled={busy} onClick={() => onExport('msu1')}>
          {exporting === 'msu1' ? 'Exporting...' : 'Export MSU-1'}
        </Button>
      </ButtonRow>
    </Box>
  );
};

export { MsuPackHeader };
export type { MsuPackHeaderProps };
