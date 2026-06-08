/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { ImportForm } from './ImportForm';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { TextInput } from '../../../../../design-system/primitives/TextInput';
import { Field } from '../../../../../design-system/primitives/Field';
import { MasterDetailLayout } from '../../../../../design-system/composites/MasterDetailLayout';
import { useMsuManager } from './msu/useMsuManager';
import { MsuPackList } from './msu/MsuPackList';
import { MsuTrackPanel } from './msu/MsuTrackPanel';
import type { MsuManagerProps } from './msu/msu.type';

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

  const list = (
    <>
      <Box className="import-form">
        <Field label="Pack Name">
          <TextInput type="text" placeholder="My MSU Pack" value={newPackName} onChange={(e) => setNewPackName(e.target.value)} />
        </Field>
      </Box>
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
    </>
  );

  const detail = !selected ? (
    <Text>Select an MSU pack to view tracks</Text>
  ) : loadingFiles ? (
    <Text>Loading…</Text>
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
  );

  return <MasterDetailLayout list={list} detail={detail} detailEmpty={!selected} />;
};

export { MsuManager };
export type { MsuManagerProps };
