/* @layer renderer-app @kind config */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { defineScreens } from '@drizztdourden08/brock-react';

export default defineScreens({
  buckets: [
    {
      id: 'game',
      title: msg('views-mobile-shell:menu.game'),
      icon: 'gamepad-2',
      menu: 'entry',
      groups: [
        { id: 'video', label: msg('data-manager:settings-sections.title.video') },
        { id: 'gameplay', label: msg('data-manager:settings-sections.title.gameplay') },
        { id: 'extras', label: msg('data-manager:settings-sections.title.extras') },
        { id: 'app', label: msg('data-manager:settings-sections.title.app') },
      ],
    },
    {
      id: 'data',
      title: msg('views-data-home:hero.eyebrow'),
      icon: 'archive',
      menu: 'submenu',
      requiresProfile: false,
      groups: [
        { id: 'library', label: msg('views-data-home:library.label') },
        { id: 'studios', label: msg('views-data-home:studios.label') },
      ],
    },
    {
      id: 'store',
      title: msg('compounds:hookshop-chip.label'),
      icon: 'package',
      menu: 'entry',
      groups: [
        { id: 'catalogue', label: msg('views-store:screen.group.catalogue') },
        { id: 'mine', label: msg('views-store:screen.group.mine') },
      ],
    },
  ],
  home: 'game',
  settings: { bucket: 'game', page: 'picture' },
});
