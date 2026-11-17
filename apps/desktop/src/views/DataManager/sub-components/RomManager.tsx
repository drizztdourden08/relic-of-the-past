/* @layer renderer-components @kind component */
import { RomList } from './rom-manager/RomList';
import { RomDetailPanel } from './rom-manager/RomDetailPanel';
import { RomCreateWizard } from './rom-manager/RomCreateWizard';
import { useRomManager } from './rom-manager/useRomManager';
import { useRomExtraction } from './rom-manager/useRomExtraction';
import { EmptyState } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import { CreateListPane } from '@app/compounds/CreateListPane';
import { useCreateFlow } from '@app/hooks/useCreateFlow';
import type { RomManagerProps } from './RomManager.type';

const RomManager = (props: RomManagerProps) => {
  const { romStatuses, onExtractAssets, onDeleteRom, onRefresh } = props;
  const extraction = useRomExtraction({ onExtractAssets });
  const { extract } = extraction;
  const {
    setActiveKind,
    supplements,
    selected, setSelected,
    detail, loadingDetail,
    handleUrlImport, handleFileImport,
  } = useRomManager({ romStatuses, onRefresh, onExtractAssets: extract });
  const flow = useCreateFlow({ onSelect: setSelected });

  const selectedDetails = {
    selectedBase: romStatuses.find((rom) => rom.romFile === selected),
    selectedSupplement: supplements.find((s) => s.romFile === selected),
  };

  const list = (
    <CreateListPane label="New ROM" creating={flow.creating} onCreate={flow.start}>
      <RomList
        romStatuses={romStatuses}
        supplements={supplements}
        selected={flow.creating ? null : selected}
        onSelect={flow.select}
        onDelete={onDeleteRom}
      />
    </CreateListPane>
  );

  const detailPane =flow.creating ? (
    <RomCreateWizard
      extraction={extraction}
      onKindChange={setActiveKind}
      onUrlImport={handleUrlImport}
      onFileImport={handleFileImport}
      onCancel={flow.cancel}
      onCreated={flow.select}
    />
  ) : selected && <RomDetailPanel selected={selected} loadingDetail={loadingDetail} detail={detail} {...selectedDetails} onExtractAssets={extract} />;

  return (
    <ListDetailLayout
      listShowTitle={false}
      listContainers={[{ title: 'ROMs', content: list }]}
      collapsed={flow.listCollapsed}
      onCollapsedChange={flow.setListCollapsed}
      listLabel="ROM manager"
      detail={detailPane}
      emptyDetail={<EmptyState message="Select a ROM to view details" />}
    />
  );
};

export { RomManager };
