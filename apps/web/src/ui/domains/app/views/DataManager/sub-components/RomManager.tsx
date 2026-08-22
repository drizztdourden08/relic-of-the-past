/* @layer renderer-components @kind component */
import { ImportForm } from './ImportForm';
import { RomKindTabs } from './RomKindTabs';
import { RomList } from './rom-manager/RomList';
import { RomDetailPanel } from './rom-manager/RomDetailPanel';
import { useRomManager } from './rom-manager/useRomManager';
import { MasterDetailLayout } from '@ds/composites/MasterDetailLayout';
import { IMPORT_LANE_CONFIG } from './rom-manager/import-lane-config';

interface RomManagerProps {
  romStatuses: RomDisplayInfo[];
  onImportRom: () => void;
  onExtractAssets: (romFile: string) => void;
  onDeleteRom: (romFile: string) => void;
  onRefresh: () => void;
}

const RomManager = (props: RomManagerProps) => {
  const { romStatuses, onExtractAssets, onDeleteRom, onRefresh } = props;
  const {
    activeKind, setActiveKind,
    supplements,
    selected, setSelected,
    detail, loadingDetail,
    handleUrlImport, handleFileImport,
  } = useRomManager({ romStatuses, onRefresh, onExtractAssets });

  const laneConfig = IMPORT_LANE_CONFIG[activeKind];
  const selectedBase = romStatuses.find((rom) => rom.romFile === selected);
  const selectedSupplement = supplements.find((s) => s.romFile === selected);

  const list = (
    <>
      <RomKindTabs value={activeKind} onChange={setActiveKind} />
      <ImportForm
        kind="rom"
        placeholder={laneConfig.placeholder}
        accept={laneConfig.accept}
        dropLabel={laneConfig.dropLabel}
        dropHint={laneConfig.dropHint}
        onUrlImport={handleUrlImport}
        onFileImport={handleFileImport}
      />

      <RomList
        romStatuses={romStatuses}
        supplements={supplements}
        selected={selected}
        onSelect={setSelected}
        onDelete={onDeleteRom}
      />
    </>
  );

  const detailContent = (
    <RomDetailPanel
      selected={selected}
      loadingDetail={loadingDetail}
      detail={detail}
      selectedBase={selectedBase}
      selectedSupplement={selectedSupplement}
      onExtractAssets={onExtractAssets}
    />
  );

  return <MasterDetailLayout list={list} detail={detailContent} detailEmpty={!selected} />;
};

export { RomManager };
export type { RomManagerProps };
