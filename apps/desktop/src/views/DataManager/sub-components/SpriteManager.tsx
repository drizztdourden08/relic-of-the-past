/* @layer renderer-components @kind component */
import { EmptyState, Text } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import { CreateListPane } from '@app/compounds/CreateListPane';
import { useCreateFlow } from '@app/hooks/useCreateFlow';
import { SpriteGrid } from './SpriteGrid';
import { ImportedSpriteList } from './sprite-manager/ImportedSpriteList';
import { SpriteCreateWizard } from './sprite-manager/SpriteCreateWizard';
import { useSpriteActions } from './sprite-manager/useSpriteActions';
import { useSpriteBaseUrl } from './sprite-manager/useSpriteBaseUrl';
import { useSpriteLibrary } from './sprite-manager/useSpriteLibrary';
import type { SpriteManagerProps } from './SpriteManager.type';
import './SpriteManager.css';

const SpriteManager = (props: SpriteManagerProps) => {
  const { romStatuses } = props;
  const library = useSpriteLibrary(romStatuses);
  const { extractedMap, selectedRom, setSelectedRom, romsWithAssets, importedRoms, refreshExtracted } = library;
  const flow = useCreateFlow({ onSelect: setSelectedRom });
  const spriteBaseUrl = useSpriteBaseUrl(selectedRom);
  const { busy, error, handleExtract, handleDelete } = useSpriteActions({ refreshExtracted });

  const notice = error === null ? null : <Text variant="caption" tone="danger" role="alert">{error}</Text>;

  const list = (
    <CreateListPane label="New sprite set" creating={flow.creating} onCreate={flow.start} available={romsWithAssets.length > 0} notice={notice}>
      <ImportedSpriteList
        importedRoms={importedRoms}
        extractedMap={extractedMap}
        selectedRom={flow.creating ? '' : selectedRom}
        onSelect={flow.select}
        onDelete={handleDelete}
      />
    </CreateListPane>
  );

  const detail = flow.creating ? (
    <SpriteCreateWizard
      roms={romsWithAssets}
      extractedMap={extractedMap}
      busy={busy}
      onExtract={handleExtract}
      onCancel={flow.cancel}
      onCreated={flow.select}
    />
  ) : selectedRom && spriteBaseUrl ? <SpriteGrid baseUrl={spriteBaseUrl} /> : null;

  return (
    <ListDetailLayout
      listShowTitle={false}
      listContainers={[{ title: 'Sprites', content: list }]}
      collapsed={flow.listCollapsed}
      onCollapsedChange={flow.setListCollapsed}
      listLabel="Sprite manager"
      detail={detail}
      emptyDetail={<EmptyState message="Select an imported ROM to view its sprites" />}
    />
  );
};

export { SpriteManager };
