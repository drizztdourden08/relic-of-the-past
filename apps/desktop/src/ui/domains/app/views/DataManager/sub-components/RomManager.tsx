/* @layer renderer-components @kind component */
import { useState, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { ImportForm } from './ImportForm';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { IconButton } from '../../../../../design-system/primitives/IconButton';
import { Button } from '../../../../../design-system/primitives/Button';
import { EmptyState } from '../../../../../design-system/primitives/EmptyState';
import { MasterDetailLayout } from '../../../../../design-system/composites/MasterDetailLayout';
import { ListItemRow } from '../../../../../design-system/composites/ListItemRow';
import { formatBytes } from '../../../../../../utils/formatBytes';

const IL: Record<string, CSSProperties> = {
  mono: { fontFamily: 'var(--font-mono)' },
  green: { color: 'var(--c-green)' },
  gold: { color: 'var(--c-gold)' },
};

interface RomManagerProps {
  romStatuses: RomDisplayInfo[];
  onImportRom: () => void;
  onExtractAssets: (romFile: string) => void;
  onDeleteRom: (romFile: string) => void;
  onRefresh: () => void;
}

interface RomDetail {
  name: string;
  size: number;
  hash: string;
  created: string;
  modified: string;
}

const RomManager = (props: RomManagerProps) => {
  const { romStatuses, onImportRom, onExtractAssets, onDeleteRom, onRefresh } = props;
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<RomDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Load ROM detail when selection changes
  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    setLoadingDetail(true);
    window.api.getRomInfo(selected).then((info) => {
      setDetail(info);
      setLoadingDetail(false);
    });
  }, [selected]);

  const handleUrlImport = useCallback(async (url: string) => {
    const result = await window.api.importRomUrl(url);
    if (result.success) {
      onRefresh();
      if (!result.alreadyExists) {
        onExtractAssets(result.romFile);
      }
      return { success: true, message: result.alreadyExists ? 'ROM already imported' : `Imported ${result.romFile}` };
    }
    return { success: false, message: result.error ?? 'Download failed' };
  }, [onRefresh, onExtractAssets]);

  const handleFileImport = useCallback(async (files: File[]) => {
    if (files.length === 0) return { success: false, message: 'No file selected' };
    const filePath = window.api.getFilePath(files[0]);
    if (!filePath) return { success: false, message: 'Could not read file path' };
    const result = await window.api.importRom(filePath);
    if (result.success) {
      onRefresh();
      // Auto-extract assets
      if (!result.alreadyExists) {
        onExtractAssets(result.romFile);
      }
      return { success: true, message: result.alreadyExists ? `ROM already imported` : `Imported ${result.romFile}` };
    }
    return { success: false, message: result.error ?? 'Import failed' };
  }, [onRefresh, onExtractAssets]);

  const selectedRom = romStatuses.find((r) => r.romFile === selected);

  const list = (
    <>
      <ImportForm
        kind="rom"
        placeholder="Paste ROM download URL…"
        accept={['.sfc', '.smc', '.zip', '.7z', '.rar']}
        dropLabel="Drop ROM file here"
        dropHint=".sfc, .smc, or compressed archive (.zip, .7z, .rar)"
        onUrlImport={handleUrlImport}
        onFileImport={handleFileImport}
      />

      <Box className="data-list">
        {romStatuses.length === 0 && <EmptyState message="No ROMs imported yet" />}
        {romStatuses.map((rom) => (
          <ListItemRow
            key={rom.romFile}
            icon="🎮"
            name={rom.romFile}
            selected={selected === rom.romFile}
            onClick={() => setSelected(rom.romFile)}
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
              <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => { e.stopPropagation(); onDeleteRom(rom.romFile); }}>
                ✕
              </IconButton>
            }
          />
        ))}
      </Box>
    </>
  );

  const detailContent = (
    <>
        {!selected ? (
          <Text>Select a ROM to view details</Text>
        ) : loadingDetail ? (
          <Text>Loading…</Text>
        ) : detail ? (
          <Box>
            <Text as="h3" className="detail-panel__title">{detail.name}</Text>
            <Box className="detail-panel__grid">
              <Text className="detail-panel__label">Size</Text>
              <Text className="detail-panel__value">{formatBytes(detail.size)}</Text>

              <Text className="detail-panel__label">Hash</Text>
              <Text className="detail-panel__value" style={IL.mono}>{detail.hash}</Text>

              <Text className="detail-panel__label">Added</Text>
              <Text className="detail-panel__value">{new Date(detail.created).toLocaleDateString()}</Text>

              <Text className="detail-panel__label">Modified</Text>
              <Text className="detail-panel__value">{new Date(detail.modified).toLocaleDateString()}</Text>

              <Text className="detail-panel__label">Assets</Text>
              <Text className="detail-panel__value">
                {selectedRom?.extractionStatus === 'ready' ? (
                  <Text style={IL.green}>✓ Extracted{selectedRom.assetSize ? ` (${formatBytes(selectedRom.assetSize)})` : ''}</Text>
                ) : selectedRom?.extractionStatus === 'extracting' ? (
                  <Text style={IL.gold}>⟳ Extracting…</Text>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => selected && onExtractAssets(selected)}>
                    Extract Assets
                  </Button>
                )}
              </Text>
            </Box>
          </Box>
        ) : (
          <Text>ROM info not available</Text>
        )}
    </>
  );

  return <MasterDetailLayout list={list} detail={detailContent} detailEmpty={!selected} />;
};

export { RomManager };
export type { RomManagerProps };
