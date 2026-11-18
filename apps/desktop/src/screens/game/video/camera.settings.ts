/* @layer renderer-app @kind config */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ScreenMeta, SectionDef } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Camera', icon: 'image', order: 3, keywords: ['camera', 'scroll', 'lock', 'transition'] };

const sections: SectionDef[] = [
  {
    id: 'camera',
    title: msg('settings-camera:section.camera.title'),
    items: [
      { key: 'cameraLockToViewport', label: msg('settings-camera:camera-lock-to-viewport.label'), description: msg('settings-camera:camera-lock-to-viewport.description'), hint: msg('settings-camera:camera-lock-to-viewport.hint'), keywords: 'camera lock viewport edge black border bound speedrun glitch wide tall' },
      { key: 'smoothTransitions', label: msg('settings-camera:smooth-transitions.label'), description: msg('settings-camera:smooth-transitions.description'), keywords: 'smooth transition scroll area seam tilemap' },
    ],
  },
];

export default sections;
export { meta };
