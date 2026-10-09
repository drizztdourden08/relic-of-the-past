/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import type { Section, SettingItem } from '../../../compounds/SettingsLayout';

const buildCameraSection = (s: GameSettings): Section | null => {
  if (!s.extendedRendering) return null;

  const items: SettingItem[] = [
    {
      key: 'cameraLockToViewport',
      label: 'Lock Camera to View',
      description: 'Pins the rendered view to the area boundary, so there is no out-of-area black space. Off = original camera (speedrun/glitch parity).',
      keywords: 'camera lock viewport edge black border bound speedrun glitch wide tall',
    },
  ];

  if (s.cameraLockToViewport) {
    items.push({
      key: 'smoothTransitions',
      label: 'Smooth Transitions',
      description: 'Pans through area seams via a 2-area tilemap, which removes the wrapped-edge slice at screen boundaries. Requires camera lock.',
      keywords: 'smooth transition scroll area seam tilemap',
    });
  }

  return { id: 'camera', title: 'Camera', items };
};

export { buildCameraSection };
