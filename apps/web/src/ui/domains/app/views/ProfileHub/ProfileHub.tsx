/* @layer renderer-components @kind component */
import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../../design-system/primitives/Button';
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { Spinner } from '../../../../design-system/primitives/Spinner';
import { ToastContainer } from '../../../../design-system/primitives/Toast';
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
  const setActiveTab = (tab: ProfileHubTab) => { onTabChange?.(tab); setInternalTab(tab); };

  const { settings, handleSettingsChange, gamePaused, handleTogglePause, toasts, dismissToast } = useProfileSettings(props);

  // Stop is slow (save-on-quit → teardown); show feedback and ignore re-taps until done.
  const [stopping, setStopping] = useState(false);
  useEffect(() => { if (!isGameRunning) setStopping(false); }, [isGameRunning]);
  const handleStop = useCallback(() => { setStopping(true); onStopGame(); }, [onStopGame]);

  // Reflect the per-profile notch preference on <html> whenever it changes.
  useEffect(() => { applyNotchMode(settings.renderIntoNotch); }, [settings.renderIntoNotch]);

  // Search palette bridge: while this profile's hub is mounted, it's the sole read/write
  // owner of GameSettings — register so the palette can show and flip inline toggles.
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
      {/* Profile Header — always visible */}
      <Box className="profile-hub__header">
        <Box className="profile-hub__title-row">
          <Text as="h1" className="profile-hub__name">{profile.name}</Text>
          <Box className="profile-hub__actions">
            {!isGameRunning ? (
              <Button variant="primary" size="md" onClick={onStartGame}>▶ Play</Button>
            ) : (
              <>
                <Button variant="tertiary" size="md" onClick={handleTogglePause} disabled={stopping}>
                  {gamePaused ? '▶ Resume' : '⏸ Pause'}
                </Button>
                <Button variant="danger" size="md" onClick={handleStop} disabled={stopping}>
                  {stopping ? <><Spinner size="sm" /> Stopping…</> : '■ Stop'}
                </Button>
                <Button variant="tertiary" size="md" onClick={onResetGame} disabled={stopping}>↻ Reset</Button>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Body: left tabs + content */}
      <ProfileHubBody
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onChange={handleSettingsChange}
        profile={profile}
        isGameRunning={isGameRunning}
        onStartGame={onStartGame}
      />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </Box>
  );
};

export { ProfileHub };
