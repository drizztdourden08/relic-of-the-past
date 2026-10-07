/* @layer renderer-components @kind component */
import { useState, useEffect } from 'react';
import { Box } from '../../../../design-system/primitives/Box';
import { ToastContainer } from '../../../../design-system/primitives/Toast';
import { applyNotchMode } from '@app/hooks/useSafeAreaInsets';
import { useSearchStore } from '@app/stores/search-store';
import { useProfileSettings } from './behavior/useProfileSettings';
import { ProfileHubBody } from './sub-components/ProfileHubBody';
import { scrollToAnchor } from '../SearchPalette/behavior/scroll-to-anchor';
import './ProfileHub.css';
import type { ProfileHubProps, ProfileHubTab } from './ProfileHub.type';

/** The profile window's body. Its title bar belongs to the host layer, which shows the game controls there off the home tab. */
const ProfileHub = (props: ProfileHubProps) => {
  const { profile, isGameRunning, onStartGame, onStopGame, onResetGame, activeTab: controlledTab, onTabChange } = props;
  const [internalTab, setInternalTab] = useState<ProfileHubTab>('home');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: ProfileHubTab) => { onTabChange?.(tab); setInternalTab(tab); };

  const { settings, handleSettingsChange, toasts, dismissToast } = useProfileSettings(props);

  // Reflect the per-profile notch preference on <html> whenever it changes.
  useEffect(() => { applyNotchMode(settings.renderIntoNotch); }, [settings.renderIntoNotch]);

  // Search palette bridge: while this profile's hub is mounted, it's the sole read/write
  // owner of GameSettings, so register and let the palette show and flip inline toggles.
  const registerSettings = useSearchStore((s) => s.registerSettings);
  const clearSettings = useSearchStore((s) => s.clearSettings);
  useEffect(() => { registerSettings(settings, handleSettingsChange); }, [settings, handleSettingsChange, registerSettings]);
  useEffect(() => () => clearSettings(), [clearSettings]);

  // Consume a pending tab switch (e.g. from a DisabledOverlay's "Open Settings" action)
  // before the anchor effect below runs, so it scrolls on the tab it just landed on.
  const pendingTab = useSearchStore((s) => s.pendingTab);
  const setPendingTab = useSearchStore((s) => s.setPendingTab);
  useEffect(() => {
    if (!pendingTab) return;
    setActiveTab(pendingTab as ProfileHubTab);
    setPendingTab(null);
  }, [pendingTab, setPendingTab]);

  // Consume a pending search deep-link once the target tab's content is showing.
  const pendingAnchor = useSearchStore((s) => s.pendingAnchor);
  const setPendingAnchor = useSearchStore((s) => s.setPendingAnchor);
  useEffect(() => {
    if (!pendingAnchor) return;
    scrollToAnchor(pendingAnchor);
    setPendingAnchor(null);
  }, [pendingAnchor, activeTab, setPendingAnchor]);

  return (
    <Box className="profile-hub">
      {/* Body: left tabs + content */}
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
