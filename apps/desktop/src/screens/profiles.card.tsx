/* @layer renderer-app @kind component */
import { useCallback, useMemo, useState } from 'react';
import { ProfilesScreen } from '@drizztdourden08/brock-react';
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { CreateProfileForm } from '@domains/app/compounds/CreateProfileForm';
import { useDataLibrary } from '@domains/app/views/DataManager/behavior/useDataLibrary';

const meta: ScreenMeta = { title: 'Profiles', icon: 'users', requiresProfile: false, keywords: ['profile', 'switch', 'create', 'rename', 'delete', 'rom'] };

const romOf = (profile: Profile): string => profile.romFile.replace(/\.(sfc|smc)$/i, '');

const ProfilesCard = () => {
  const { profileMgmt } = useDataLibrary();
  const { romDisplayInfos, handleImportRom } = profileMgmt;
  const [picked, setPicked] = useState('');
  const readyRoms = useMemo(() => romDisplayInfos.filter((rom) => rom.hasAssets || rom.extractionStatus === 'ready'), [romDisplayInfos]);
  const extracting = romDisplayInfos.some((rom) => rom.extractionStatus === 'extracting');
  const romFile = readyRoms.some((rom) => rom.romFile === picked) ? picked : readyRoms[0]?.romFile ?? '';
  const createOptions = useCallback(() => ({ romFile }), [romFile]);
  const importRom = useCallback(() => { void handleImportRom(); }, [handleImportRom]);

  const fields = <CreateProfileForm readyRoms={readyRoms} romFile={romFile} extracting={extracting} onRomChange={setPicked} onImportRom={importRom} />;

  return <ProfilesScreen subtitleOf={romOf} extraFields={fields} canSubmit={romFile !== ''} createOptions={createOptions} />;
};

export default ProfilesCard;
export { meta };
