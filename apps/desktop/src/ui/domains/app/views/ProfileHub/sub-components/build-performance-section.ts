/* @layer renderer-components @kind logic */
import type { Section, SettingItem } from '../../../compounds/SettingsLayout';
import type { SyncedRateStatus } from '@shared/types/display';
import { SYNCED_RATE_KEYWORDS, VSYNC_DESCRIPTION } from './SettingsView.constants';
import { refreshAdvisory } from './refresh-advisory';
import { syncedRateDescription } from './synced-rate-description';

const buildPerformanceSection = (refreshHz: number | null, syncedRate: SyncedRateStatus): Section => {
  const items: SettingItem[] = [
    { key: 'displayPerfInTitle', label: 'Show FPS', description: 'Display the current frames per second, and the refresh rate of your display, in the title bar while the game is running', keywords: 'fps performance frame rate counter refresh rate hz' },
    { key: 'vsync', label: 'V-Sync', description: VSYNC_DESCRIPTION + refreshAdvisory(refreshHz), keywords: 'vsync v-sync tearing judder stutter frame pacing refresh rate smooth scrolling 60hz' },
    {
      key: 'syncedRefreshRate',
      label: 'Set Synced Refresh Rate in full screen',
      description: syncedRateDescription(syncedRate),
      keywords: SYNCED_RATE_KEYWORDS,
    },
  ];

  if (syncedRate.supported && syncedRate.availableRates.length > 1) {
    items.push({
      key: 'syncedRefreshRateHz',
      label: 'Target Refresh Rate',
      description: 'Which rate to switch to. Always a multiple of 60, so every game frame is shown for the same length of time. Higher is smoother for everything else on screen; 60 is the safest if a higher rate ever misbehaves.',
      keywords: SYNCED_RATE_KEYWORDS,
    });
  }

  return { id: 'performance', title: 'Performance', items };
};

export { buildPerformanceSection };
