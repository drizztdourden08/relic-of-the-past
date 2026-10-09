/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Camera', icon: 'image', order: 3, keywords: ['camera', 'scroll', 'lock', 'transition'] };

const sections: Section[] = [
  {
    id: 'camera',
    title: 'Camera',
    items: [
      { key: 'cameraLockToViewport', label: 'Lock Camera to View', description: 'Pins the rendered view to the area boundary, so there is no out-of-area black space. Off = original camera (speedrun/glitch parity).', hint: 'On, the view stops at the edge of each area so no black space shows. Needs Extended Rendering, in Display.', keywords: 'camera lock viewport edge black border bound speedrun glitch wide tall' },
      { key: 'smoothTransitions', label: 'Smooth Transitions', description: 'Pans through area seams via a 2-area tilemap, which removes the wrapped-edge slice at screen boundaries. Requires camera lock.', hint: 'On, moving between areas pans without the wrapped slice at the edge. Needs Lock Camera to View.', keywords: 'smooth transition scroll area seam tilemap' },
    ],
  },
];

export default sections;
export { meta };
