/* @layer renderer-components @kind component */
import { useState, useEffect, useCallback } from 'react';
import { DataHome } from './sub-components/DataHome';
import { ProfileManager } from './sub-components/ProfileManager';
import { RomManager } from './sub-components/RomManager';
import { LanguageManager } from './sub-components/LanguageManager';
import { MsuManager } from './sub-components/MsuManager';
import { SpriteManager } from './sub-components/SpriteManager';
import { PlayerSpriteManager } from './sub-components/PlayerSpriteManager';
import { Spinner } from '../../../../design-system/primitives/Spinner';
import { Box } from '../../../../design-system/primitives/Box';
import { NavRail } from '../../../../design-system/composites/NavRail';
import { ListItemRow } from '../../../../design-system/composites/ListItemRow';
import './DataManager.css';
import './sub-components/DataManager.detail.css';
import type { DataTab, DataManagerProps } from './DataManager.type';



const DataManager = (props: DataManagerProps) => {
  const {
    profiles,
    romStatuses,
    onSelectProfile,
    onCreateProfile,
    onDeleteProfile,
    onImportRom,
    onExtractAssets,
    onDeleteRom,
    onRefresh,
    onDeleteConfirm,
    loadingProfile = null,
    initialTab,
    isGameRunning = false,
  } = props;
  const [activeTab, setActiveTab] = useState<DataTab>(initialTab ?? 'home');

  // Sync tab when navigating from TitleBar
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const handleRefresh = useCallback(() => { onRefresh(); }, [onRefresh]);

  const tabs: { id: DataTab; icon: string; label: string }[] = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'profiles', icon: '👤', label: 'Profiles' },
    { id: 'roms', icon: '🎮', label: 'ROMs' },
    { id: 'sprites', icon: '🖼️', label: 'Sprites' },
    { id: 'linkSprites', icon: '🧝', label: 'Player Sprites' },
    { id: 'languages', icon: '🌐', label: 'Languages' },
    { id: 'msu', icon: '🎵', label: 'MSU Studio' },
  ];

  return (
    <Box className="data-manager">
      {loadingProfile && (
        <Box className="data-manager__loading">
          <ListItemRow selected icon={<Spinner size="sm" />} name={`Loading profile: ${loadingProfile}…`} />
        </Box>
      )}

      <Box className="data-manager__body">
        <NavRail
          className="data-manager__tabs"
          items={tabs}
          activeId={activeTab}
          onSelect={(id) => setActiveTab(id as DataTab)}
        />

        <Box className="data-manager__content">
          {activeTab === 'home' && <DataHome />}
          {activeTab === 'profiles' && (
            <ProfileManager
              profiles={profiles}
              romStatuses={romStatuses}
              onSelectProfile={onSelectProfile}
              onCreateProfile={onCreateProfile}
              onDeleteProfile={onDeleteProfile}
              onRefresh={handleRefresh}
              isGameRunning={isGameRunning}
            />
          )}
          {activeTab === 'roms' && (
            <RomManager
              romStatuses={romStatuses}
              onImportRom={onImportRom}
              onExtractAssets={onExtractAssets}
              onDeleteRom={onDeleteRom}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === 'languages' && (
            <LanguageManager
              romStatuses={romStatuses}
              onDeleteConfirm={onDeleteConfirm}
            />
          )}
          {activeTab === 'msu' && (
            <MsuManager
              onDeleteConfirm={onDeleteConfirm}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === 'sprites' && (
            <SpriteManager
              romStatuses={romStatuses}
            />
          )}
          {activeTab === 'linkSprites' && <PlayerSpriteManager onDeleteConfirm={onDeleteConfirm} />}
        </Box>
      </Box>
    </Box>
  );
};

export { DataManager };
