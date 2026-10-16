/* @layer renderer-components @kind component */
import { useState } from 'react';
import { EmptyState } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import { SpriteGrid } from './SpriteGrid';
import { useImportProgress } from '@app/hooks/useImportProgress';
import { ImportedSpriteList } from './sprite-manager/ImportedSpriteList';
import { SpriteExtractPanel } from './sprite-manager/SpriteExtractPanel';
import { useSpriteActions } from './sprite-manager/useSpriteActions';
import { useSpriteBaseUrl } from './sprite-manager/useSpriteBaseUrl';
import { useSpriteLibrary } from './sprite-manager/useSpriteLibrary';
import type { SpriteManagerProps } from './SpriteManager.type';
import './SpriteManager.css';

const SpriteManager = (props: SpriteManagerProps) => {
  const { romStatuses } = props;
  const [toExtract, setToExtract] = useState('');
  const progress = useImportProgress('sprite');
  const library = useSpriteLibrary(romStatuses);
  const { extractedMap, selectedRom, setSelectedRom, romsWithAssets, importedRoms, refreshExtracted } = library;
  const spriteBaseUrl = useSpriteBaseUrl(selectedRom);
  const { busy, message, handleExtract, handleDelete } = useSpriteActions({
    toExtract, setToExtract, setSelectedRom, refreshExtracted,
  });

  const list = (
    <>
      <SpriteExtractPanel
        roms={romsWithAssets}
        extractedMap={extractedMap}
        toExtract={toExtract}
        onToExtractChange={setToExtract}
        busy={busy}
        message={message}
        progress={progress}
        onExtract={handleExtract}
      />
      <ImportedSpriteList
        importedRoms={importedRoms}
        extractedMap={extractedMap}
        selectedRom={selectedRom}
        onSelect={setSelectedRom}
        onDelete={handleDelete}
      />
    </>
  );

  return (
    <ListDetailLayout
      list={list}
      detail={selectedRom && spriteBaseUrl ? <SpriteGrid baseUrl={spriteBaseUrl} /> : null}
      emptyDetail={<EmptyState message="Select an imported ROM to view its sprites" />}
    />
  );
};

export { SpriteManager };
