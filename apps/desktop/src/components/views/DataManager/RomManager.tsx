import { useState, useEffect, useCallback } from 'react';
import { ImportForm } from './ImportForm';
import { IconButton } from '../../primitives/IconButton';

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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function RomManager({ romStatuses, onImportRom, onExtractAssets, onDeleteRom, onRefresh }: RomManagerProps) {
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

  return (
    <div className="data-columns">
      <div className="data-columns__left">
        <ImportForm
          placeholder="Paste ROM download URL…"
          accept={['.sfc', '.smc', '.zip', '.7z', '.rar']}
          dropLabel="Drop ROM file here"
          dropHint=".sfc, .smc, or compressed archive (.zip, .7z, .rar)"
          onUrlImport={handleUrlImport}
          onFileImport={handleFileImport}
        />

        <div className="data-list">
          {romStatuses.length === 0 && (
            <div className="data-list-empty">No ROMs imported yet</div>
          )}
          {romStatuses.map((rom) => (
            <div
              key={rom.romFile}
              className={`data-list-item ${selected === rom.romFile ? 'data-list-item--selected' : ''}`}
              onClick={() => setSelected(rom.romFile)}
            >
              <span className="data-list-item__icon">🎮</span>
              <div className="data-list-item__info">
                <div className="data-list-item__name">{rom.romFile}</div>
                <div className="data-list-item__meta">
                  {rom.extractionStatus === 'ready' ? '✓ Assets extracted' :
                   rom.extractionStatus === 'extracting' ? '⟳ Extracting…' :
                   rom.extractionStatus === 'failed' ? '✗ Extraction failed' :
                   'No assets'}
                  {rom.assetSize ? ` · ${formatBytes(rom.assetSize)}` : ''}
                </div>
              </div>
              <div className="data-list-item__action">
                <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => { e.stopPropagation(); onDeleteRom(rom.romFile); }}>
                  ✕
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`data-columns__right ${!selected ? 'data-columns__right--empty' : ''}`}>
        {!selected ? (
          <span>Select a ROM to view details</span>
        ) : loadingDetail ? (
          <span>Loading…</span>
        ) : detail ? (
          <div>
            <h3 className="detail-panel__title">{detail.name}</h3>
            <div className="detail-panel__grid">
              <span className="detail-panel__label">Size</span>
              <span className="detail-panel__value">{formatBytes(detail.size)}</span>

              <span className="detail-panel__label">Hash</span>
              <span className="detail-panel__value" style={{ fontFamily: 'var(--font-mono)' }}>{detail.hash}</span>

              <span className="detail-panel__label">Added</span>
              <span className="detail-panel__value">{new Date(detail.created).toLocaleDateString()}</span>

              <span className="detail-panel__label">Modified</span>
              <span className="detail-panel__value">{new Date(detail.modified).toLocaleDateString()}</span>

              <span className="detail-panel__label">Assets</span>
              <span className="detail-panel__value">
                {selectedRom?.extractionStatus === 'ready' ? (
                  <span style={{ color: 'var(--color-success)' }}>✓ Extracted{selectedRom.assetSize ? ` (${formatBytes(selectedRom.assetSize)})` : ''}</span>
                ) : selectedRom?.extractionStatus === 'extracting' ? (
                  <span style={{ color: 'var(--color-gold-base)' }}>⟳ Extracting…</span>
                ) : (
                  <button
                    className="import-form__download-btn"
                    onClick={() => selected && onExtractAssets(selected)}
                    style={{ fontSize: 'var(--text-xs)', padding: '2px 8px' }}
                  >
                    Extract Assets
                  </button>
                )}
              </span>
            </div>
          </div>
        ) : (
          <span>ROM info not available</span>
        )}
      </div>
    </div>
  );
}
