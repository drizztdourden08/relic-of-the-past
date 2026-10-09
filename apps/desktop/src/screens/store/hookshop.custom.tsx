/* @layer renderer-app @kind component */
import type { PageProps, ScreenMeta, SearchEntrySeed } from '@drizztdourden08/brock-react';
import { useGameSession } from '@app/hooks/useGameSession';
import { Store, isStoreSection } from '@domains/app/views/Store';

const meta: ScreenMeta = { title: 'Hookshop', icon: 'package', order: 1, fill: true, keywords: ['store', 'shop', 'packs', 'install', 'download'] };

const searchEntries: SearchEntrySeed[] = [
  { id: 'browse', label: 'Browse packs', keywords: ['catalogue', 'store'], params: { section: 'browse' }, description: 'Every pack in the Hookshop' },
  { id: 'music', label: 'Music packs', keywords: ['msu', 'soundtrack'], params: { section: 'music' } },
  { id: 'character', label: 'Character packs', keywords: ['sprites', 'player sprite'], params: { section: 'character' } },
  { id: 'language', label: 'Language packs', keywords: ['translation'], params: { section: 'language' } },
  { id: 'installed', label: 'Installed packs', keywords: ['uninstall', 'library'], params: { section: 'installed' } },
  { id: 'updates', label: 'Pack updates', keywords: ['update', 'new version'], params: { section: 'updates' } },
];

const HookshopPage = (props: PageProps) => {
  const { params } = props;
  const { profileMgmt, dialogs } = useGameSession();
  const section = isStoreSection(params.section) ? params.section : undefined;
  return <Store section={section} onLibraryChanged={profileMgmt.refreshProfilesAndRoms} onDeleteConfirm={dialogs.handleDeleteConfirm} />;
};

export default HookshopPage;
export { meta, searchEntries };
