import { useState, useEffect, useCallback } from 'react';
import { ProfileManager } from './ProfileManager';
import { RomManager } from './RomManager';
import { LanguageManager } from './LanguageManager';
import { MsuManager } from './MsuManager';
import { SpriteManager } from './SpriteManager';
import './DataManager.css';

type DataTab = 'profiles' | 'roms' | 'languages' | 'msu' | 'sprites';

interface DataManagerProps {
  profiles: Profile[];
  romStatuses: RomDisplayInfo[];
  onSelectProfile: (profile: Profile) => void;
  onCreateProfile: (name: string, romFile: string, language?: string, msuPack?: string) => void;
  onDeleteProfile: (id: string) => void;
  onImportRom: () => void;
  onExtractAssets: (romFile: string) => void;
  onDeleteRom: (romFile: string) => void;
  onRefresh: () => void;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  loadingProfile?: string | null;
  initialTab?: DataTab;
  isGameRunning?: boolean;
  onSwitchProfile: () => void;
}

export function DataManager({
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
}: DataManagerProps) {
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
        <div style={{ padding: '0 var(--space-sm) var(--space-md)' }}>
          <div className="data-list-item" style={{ background: 'rgba(200, 168, 78, 0.08)', borderColor: 'var(--color-gold-dim)' }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
            <span style={{ color: 'var(--color-gold-bright)', fontSize: 'var(--text-sm)' }}>Loading profile: {loadingProfile}…</span>
          </div>
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
}
