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
        description: 'Create, open and delete profiles.',
      },
      {
        id: 'roms',
        title: 'ROMs',
        icon: 'gamepad-2',
        description: 'Import a ROM and extract its assets.',
      },
      {
        id: 'sprites',
        title: 'Sprites',
        icon: 'image',
        description: 'Browse the extracted HUD, item and menu pictures.',
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
        description: 'Import, create and edit player sprites.',
      },
      {
        id: 'languages',
        title: 'Language Studio',
        icon: 'globe',
        description: 'Edit the game dialogue and text.',
      },
      {
        id: 'msu',
        title: 'MSU Studio',
        icon: 'headphones',
        description: 'Create, import and edit music packs.',
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
        description: 'See folder sizes, clean up old files, and export or import your data.',
      },
    ],
  },
];

export { DATA_BUCKET, DATA_SECTION_GROUPS };
