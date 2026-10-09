/* @layer renderer-components @kind component */
import { useCallback, useState, useEffect } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { ToastContainer } from '@drizztdourden08/tessera/composites';
import { applyNotchMode } from '@app/hooks/useSafeAreaInsets';
import { useSearchStore } from '@app/stores/search-store';
import { useProfileSettings } from './behavior/useProfileSettings';
import { ProfileHubBody } from './sub-components/ProfileHubBody';
import { scrollToAnchor } from '../SearchPalette/behavior/scroll-to-anchor';
import './ProfileHub.css';
import type { ProfileHubProps, ProfileHubTab } from './ProfileHub.type';

const ProfileHub = (props: ProfileHubProps) => {
  const { profile, isGameRunning, onStartGame, onStopGame, onResetGame, activeTab: controlledTab, onTabChange } = props;
  const [internalTab, setInternalTab] = useState<ProfileHubTab>('home');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = useCallback((tab: ProfileHubTab) => { onTabChange?.(tab); setInternalTab(tab); }, [onTabChange]);

  const { settings, handleSettingsChange, toasts, dismissToast } = useProfileSettings(props);

  useEffect(() => { applyNotchMode(settings.renderIntoNotch); }, [settings.renderIntoNotch]);

  const registerSettings = useSearchStore((s) => s.registerSettings);
  const clearSettings = useSearchStore((s) => s.clearSettings);
  useEffect(() => { registerSettings(settings, handleSettingsChange); }, [settings, handleSettingsChange, registerSettings]);
  useEffect(() => () => clearSettings(), [clearSettings]);

  const pendingTab = useSearchStore((s) => s.pendingTab);
  const setPendingTab = useSearchStore((s) => s.setPendingTab);
  useEffect(() => {
    if (!pendingTab) return;
    setActiveTab(pendingTab as ProfileHubTab);
    setPendingTab(null);
  }, [pendingTab, setPendingTab]);

  const pendingAnchor = useSearchStore((s) => s.pendingAnchor);
  const setPendingAnchor = useSearchStore((s) => s.setPendingAnchor);
  useEffect(() => {
    if (!pendingAnchor) return;
    scrollToAnchor(pendingAnchor);
    setPendingAnchor(null);
  }, [pendingAnchor, activeTab, setPendingAnchor]);

  return (
    <Box className="profile-hub">
      <ProfileHubBody
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onChange={handleSettingsChange}
        profile={profile}
        isGameRunning={isGameRunning}
        onStartGame={onStartGame}
        onStopGame={onStopGame}
        onResetGame={onResetGame}
      />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </Box>
  );
};

export { ProfileHub };
