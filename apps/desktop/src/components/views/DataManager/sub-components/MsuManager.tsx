import { useCallback } from 'react';
import { ImportForm } from './ImportForm';
import { useMsuManager } from './msu/useMsuManager';
import { MsuPackList } from './msu/MsuPackList';
import { MsuTrackPanel } from './msu/MsuTrackPanel';
import type { MsuManagerProps } from './msu/types';

const MsuManager = (props: MsuManagerProps) => {
  const { onDeleteConfirm, onRefresh } = props;

  const {
    packs,
    selected,
    setSelected,
    files,
    trackInfos,
    loadingFiles,
    newPackName,
    setNewPackName,
    fileOptions,
    isDeluxe,
    hasOpuz,
    matchedTracks,
    unmatchedFiles,
    handleTrackAssign,
    handleUrlImport,
    handleFileImport,
    refresh,
  } = useMsuManager(onRefresh);

  const handleDelete = useCallback((packName: string) => {
    onDeleteConfirm('Delete MSU Pack', `Delete MSU pack "${packName}"? This cannot be undone.`, async () => {
      await window.api.deleteMsuPack(packName);
      if (selected === packName) { setSelected(null); }
      await refresh();
    });
  }, [selected, refresh, onDeleteConfirm, setSelected]);

  return (
    <div className="data-columns">
      <div className="data-columns__left">
        <div className="import-form">
          <div className="profile-form__field">
            <span className="profile-form__label">Pack Name</span>
            <input
              className="profile-form__input"
              type="text"
              placeholder="My MSU Pack"
              value={newPackName}
              onChange={(e) => setNewPackName(e.target.value)}
            />
          </div>
        </div>
        <ImportForm
          placeholder="Paste MSU pack download URL…"
          accept={['.zip', '.7z', '.rar']}
          dropLabel="Drop MSU pack here"
          dropHint=".zip, .7z, or .rar archive"
          onUrlImport={handleUrlImport}
          onFileImport={handleFileImport}
        />
        <MsuPackList
          packs={packs}
          selected={selected}
          onSelect={setSelected}
          onDelete={handleDelete}
        />
      </div>

      <div className={`data-columns__right ${!selected ? 'data-columns__right--empty' : ''}`}>
        {!selected ? (
          <span>Select an MSU pack to view tracks</span>
        ) : loadingFiles ? (
          <span>Loading…</span>
        ) : (
          <MsuTrackPanel
            selected={selected}
            files={files}
            trackInfos={trackInfos}
            isDeluxe={isDeluxe}
            hasOpuz={hasOpuz}
            matchedTracks={matchedTracks}
            unmatchedFiles={unmatchedFiles}
            fileOptions={fileOptions}
            onTrackAssign={handleTrackAssign}
          />
        )}
      </div>
    </div>
  );
};

export { MsuManager };
export type { MsuManagerProps };
