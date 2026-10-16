/* @layer renderer-components @kind constants */
import type { DataSectionGroup } from '@app/compounds/DataSections';

const DATA_BUCKET = 'data';

const DATA_SECTION_GROUPS: readonly DataSectionGroup[] = [
  {
    id: 'library',
    label: 'Library',
    items: [
      {
        id: 'profiles',
        title: 'Profiles',
        icon: 'users',
        description: 'Each profile has its own ROM, language, music pack and saves. Create, open and delete them here.',
      },
      {
        id: 'roms',
        title: 'ROMs',
        icon: 'gamepad-2',
        description: 'Import a ROM from a file or a link, then extract its assets so the game can run.',
      },
      {
        id: 'sprites',
        title: 'Sprites',
        icon: 'image',
        description: 'The HUD, item and menu pictures of the game. Extract them from a ROM and browse them by category.',
      },
    ],
  },
  {
    id: 'studios',
    label: 'Studios',
    items: [
      {
        id: 'characters',
        title: 'Character Studio',
        icon: 'user',
        description: 'Change how the player looks. Import or create a sprite, edit its palette and export it as .zspr or .rsp.',
      },
      {
        id: 'languages',
        title: 'Language Studio',
        icon: 'globe',
        description: 'Edit the dialogue and text of the game. Extract a language from a ROM, or create or copy a set.',
      },
      {
        id: 'msu',
        title: 'MSU Studio',
        icon: 'headphones',
        description: 'Edit music packs. Create or import a pack, then edit its tracks, ambient sounds, effects and files.',
      },
    ],
  },
  {
    id: 'folder',
    label: 'Data folder',
    items: [
      {
        id: 'storage',
        title: 'Storage',
        icon: 'hard-drive',
        description: 'See what each folder holds and how big it is. Clean up old files, and export or import your data.',
      },
    ],
  },
];

export { DATA_BUCKET, DATA_SECTION_GROUPS };
