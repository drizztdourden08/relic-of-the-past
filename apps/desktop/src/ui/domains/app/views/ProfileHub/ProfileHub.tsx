/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Button } from '../../../../design-system/primitives/Button';
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { ToastContainer } from '../../../../design-system/primitives/Toast';
import { useProfileSettings } from './profile-hub/useProfileSettings';
import { ProfileHubBody } from './profile-hub/ProfileHubBody';
import './ProfileHub.css';
import type { ProfileHubProps, ProfileHubTab } from './ProfileHub.type';

const ProfileHub = (props: ProfileHubProps) => {
  const { profile, isGameRunning, onStartGame, onStopGame, onResetGame, activeTab: controlledTab, onTabChange } = props;
  const [internalTab, setInternalTab] = useState<ProfileHubTab>('home');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: ProfileHubTab) => { onTabChange?.(tab); setInternalTab(tab); };

  const { settings, handleSettingsChange, gamePaused, handleTogglePause, toasts, dismissToast } = useProfileSettings(props);

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
                <Button variant="secondary" size="md" onClick={handleTogglePause}>
                  {gamePaused ? '▶ Resume' : '⏸ Pause'}
                </Button>
                <Button variant="danger" size="md" onClick={onStopGame}>■ Stop</Button>
                <Button variant="secondary" size="md" onClick={onResetGame}>↻ Reset</Button>
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
