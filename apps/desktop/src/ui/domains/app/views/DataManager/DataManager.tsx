/* @layer renderer-components @kind component */
import { useState, useEffect, useCallback } from 'react';
import { ProfileManager } from './sub-components/ProfileManager';
import { RomManager } from './sub-components/RomManager';
import { LanguageManager } from './sub-components/LanguageManager';
import { MsuManager } from './sub-components/MsuManager';
import { SpriteManager } from './sub-components/SpriteManager';
import { Spinner } from '../../../../design-system/primitives/Spinner';
import { ListItemRow } from '../../../../design-system/composites/ListItemRow';
import './DataManager.css';
import './DataManager.detail.css';
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
    onSwitchProfile,
  } = props;
  const [activeTab, setActiveTab] = useState<DataTab>(initialTab ?? 'profiles');
  const [msuCount, setMsuCount] = useState(0);
  const [langCount, setLangCount] = useState(0);
  const [spriteCount, setSpriteCount] = useState(0);

  // Sync tab when navigating from TitleBar
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Load counts for tab badges
  const refreshCounts = useCallback(async () => {
    const [msuPacks, langs] = await Promise.all([
      window.api.listMsuPacks(),
      window.api.listLanguages(),
    ]);
    setMsuCount(msuPacks.length);
    setLangCount(langs.length);
  }, []);

  useEffect(() => { refreshCounts(); }, [refreshCounts]);

  const handleRefresh = useCallback(() => {
    onRefresh();
    refreshCounts();
  }, [onRefresh, refreshCounts]);

  const tabs: { id: DataTab; icon: string; label: string; count: number }[] = [
    { id: 'profiles', icon: '👤', label: 'Profiles', count: profiles.length },
    { id: 'roms', icon: '🎮', label: 'ROMs', count: romStatuses.length },
    { id: 'sprites', icon: '🖼️', label: 'Sprites', count: spriteCount },
    { id: 'languages', icon: '🌐', label: 'Languages', count: langCount },
    { id: 'msu', icon: '🎵', label: 'MSU', count: msuCount },
  ];

  return (
    <div className="data-manager">
      <div className="data-manager__header">
        <h2 className="data-manager__title">Data Manager</h2>
      </div>

      {loadingProfile && (
        <div className="data-manager__loading">
          <ListItemRow selected icon={<Spinner size="sm" />} name={`Loading profile: ${loadingProfile}…`} />
        </div>
      )}

      <div className="data-manager__body">
        <div className="data-manager__tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`data-manager__tab ${activeTab === tab.id ? 'data-manager__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="data-manager__tab-icon">{tab.icon}</span>
              <span className="data-manager__tab-label">{tab.label}</span>
              <span className="data-manager__tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="data-manager__content">
          {activeTab === 'profiles' && (
            <ProfileManager
              profiles={profiles}
              romStatuses={romStatuses}
              onSelectProfile={onSelectProfile}
              onCreateProfile={onCreateProfile}
              onDeleteProfile={onDeleteProfile}
              onRefresh={handleRefresh}
              isGameRunning={isGameRunning}
              onSwitchProfile={onSwitchProfile}
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
        </div>
      </div>
    </div>
  );
};

export { DataManager };
