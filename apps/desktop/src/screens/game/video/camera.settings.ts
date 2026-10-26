/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Camera', icon: 'image', order: 3, keywords: ['camera', 'scroll', 'lock', 'transition'] };

const sections: Section[] = [
  {
    id: 'camera',
    title: 'Camera',
    items: [
      { key: 'cameraLockToViewport', label: 'Lock Camera to View', description: 'Pins the view to the area boundary, so no black space shows outside it. Off keeps the original camera.', hint: 'Needs Extended Rendering, in Display.', keywords: 'camera lock viewport edge black border bound speedrun glitch wide tall' },
      { key: 'smoothTransitions', label: 'Smooth Transitions', description: 'Smooths panning across area seams. Needs Lock Camera to View.', keywords: 'smooth transition scroll area seam tilemap' },
    ],
  },
];

export default sections;
export { meta };
