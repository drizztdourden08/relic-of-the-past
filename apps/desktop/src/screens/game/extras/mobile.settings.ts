/* @layer renderer-app @kind config */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ScreenMeta, SectionDef } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Mobile', icon: 'maximize-2', order: 6, hosts: ['capacitor'], keywords: ['mobile', 'phone', 'tablet', 'notch', 'cutout'] };

const mobile: SectionDef[] = [
  {
    id: 'mobile',
    title: msg('settings-mobile:section.mobile.title'),
    items: [
      { key: 'renderIntoNotch', label: msg('settings-mobile:render-into-notch.label'), description: msg('settings-mobile:render-into-notch.description'), keywords: 'notch cutout camera safe area fullscreen mobile display edge' },
    ],
  },
  {
    id: 'mobile-behavior',
    title: msg('settings-mobile:section.mobile-behavior.title'),
    items: [
      { key: 'pauseWhenAway', label: msg('settings-mobile:pause-when-away.label'), description: msg('settings-mobile:pause-when-away.description'), keywords: 'pause background focus away minimize sound mobile' },
    ],
  },
];

const sections = (): SectionDef[] => mobile;

export default sections;
export { meta };
