/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Mobile', icon: 'maximize-2', order: 6, hosts: ['capacitor'], keywords: ['mobile', 'phone', 'tablet', 'notch', 'cutout'] };

const mobile: Section[] = [
  {
    id: 'mobile',
    title: 'Display',
    items: [
      { key: 'renderIntoNotch', label: 'Render under camera cutout', description: 'On: the game and UI use the full screen, extending under the camera notch. Off: keep everything inside the usable screen area.', hint: 'On, the picture reaches under the camera cutout. Off keeps it clear of the cutout.', keywords: 'notch cutout camera safe area fullscreen mobile display edge' },
    ],
  },
];

const sections = (): Section[] => mobile;

export default sections;
export { meta };
