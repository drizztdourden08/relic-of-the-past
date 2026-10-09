/* @layer renderer-app @kind component */
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { useDataLibrary } from '@app/views/DataManager/behavior/useDataLibrary';
import { RomManager } from '@app/views/DataManager/sub-components/RomManager';

const meta: ScreenMeta = { title: 'ROMs', icon: 'gamepad-2', order: 2, fill: true, keywords: ['rom', 'import', 'extract', 'assets', 'sfc', 'cartridge'] };

const RomsPage = () => {
  const { profileMgmt, refresh } = useDataLibrary();
  const { romDisplayInfos, handleImportRom, handleExtractAssets, handleDeleteRom } = profileMgmt;
  return (
    <RomManager
      romStatuses={romDisplayInfos}
      onImportRom={handleImportRom}
      onExtractAssets={handleExtractAssets}
      onDeleteRom={handleDeleteRom}
      onRefresh={refresh}
    />
  );
};

export default RomsPage;
export { meta };
