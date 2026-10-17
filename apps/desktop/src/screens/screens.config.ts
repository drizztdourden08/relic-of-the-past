/* @layer renderer-app @kind config */
import { defineScreens } from '@drizztdourden08/brock-react';

export default defineScreens({
  buckets: [
    {
      id: 'game',
      title: 'Game',
      icon: 'gamepad-2',
      menu: 'entry',
      groups: [
        { id: 'video', label: 'Video' },
        { id: 'gameplay', label: 'Gameplay' },
        { id: 'extras', label: 'Extras' },
        { id: 'app', label: 'App' },
      ],
    },
    { id: 'randomizer', title: 'Randomizer', icon: 'sparkles', menu: 'entry', when: ({ profile }) => profile?.randomizer !== undefined },
    {
      id: 'data',
      title: 'Data',
      icon: 'archive',
      menu: 'submenu',
      requiresProfile: false,
      groups: [
        { id: 'library', label: 'Library' },
        { id: 'studios', label: 'Studios' },
      ],
    },
    {
      id: 'store',
      title: 'Hookshop',
      icon: 'package',
      menu: 'entry',
      groups: [
        { id: 'catalogue', label: 'Catalogue' },
        { id: 'mine', label: 'On this computer' },
      ],
    },
  ],
  home: 'game',
  settings: { bucket: 'game', page: 'picture' },
});
