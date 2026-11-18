/* @layer renderer-app @kind config */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ScreenMeta, SectionDef } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Window', icon: 'app-window', order: 4, keywords: ['window', 'fullscreen', 'viewport', 'pixel perfect'] };

const viewportModes = [
  { value: 'none', label: msg('settings-window:option.viewport-modes.none.label'), hint: msg('settings-window:option.viewport-modes.none.hint') },
  { value: 'fit', label: msg('settings-window:option.viewport-modes.fit.label'), hint: msg('settings-window:option.viewport-modes.fit.hint') },
  { value: 'fill', label: msg('settings-window:option.viewport-modes.fill.label'), hint: msg('settings-window:option.viewport-modes.fill.hint') },
];

const sections: SectionDef[] = [
  {
    id: 'window',
    title: msg('settings-window:section.window.title'),
    items: [
      { key: 'startFullscreen', label: msg('settings-window:start-fullscreen.label'), description: msg('settings-window:start-fullscreen.description'), keywords: 'fullscreen launch start' },
      { key: 'viewportConstraint', label: msg('settings-window:viewport-constraint.label'), description: msg('settings-window:viewport-constraint.description'), keywords: 'ratio lock constrain aspect black bars stretch fill fit viewport', control: { kind: 'choice', options: viewportModes } },
      { key: 'pixelPerfect', label: msg('settings-window:pixel-perfect.label'), description: msg('settings-window:pixel-perfect.description'), hint: msg('settings-window:pixel-perfect.hint'), keywords: 'pixel perfect integer scale scaling sharp crisp shimmer wobble ripple tearing nearest' },
    ],
  },
];

export default sections;
export { meta };
