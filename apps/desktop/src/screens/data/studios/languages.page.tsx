/* @layer renderer-app @kind component */
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { useDataLibrary } from '@app/views/DataManager/behavior/useDataLibrary';
import { LanguageManager } from '@app/views/DataManager/sub-components/LanguageManager';

const meta: ScreenMeta = { title: 'Language Studio', icon: 'globe', order: 2, fill: true, keywords: ['language', 'translation', 'dialogue', 'text', 'messages'] };

const LanguagesPage = () => {
  const { profileMgmt, onDeleteConfirm } = useDataLibrary();
  return <LanguageManager romStatuses={profileMgmt.romDisplayInfos} onDeleteConfirm={onDeleteConfirm} />;
};

export default LanguagesPage;
export { meta };
