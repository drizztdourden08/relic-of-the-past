/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { DataSectionGroup } from '@app/compounds/DataSections';

const DATA_BUCKET = 'data';

const dataSectionGroups = (t: I18n['t']): readonly DataSectionGroup[] => [
  {
    id: 'library',
    label: t('views-data-home:library.label'),
    items: [
      {
        id: 'profiles',
        title: t('views-data-home:library.profiles.title'),
        icon: 'users',
        description: t('views-data-home:library.profiles.description'),
      },
      {
        id: 'roms',
        title: t('views-data-home:library.roms.title'),
        icon: 'gamepad-2',
        description: t('views-data-home:library.roms.description'),
      },
      {
        id: 'sprites',
        title: t('views-data-home:library.sprites.title'),
        icon: 'image',
        description: t('views-data-home:library.sprites.description'),
      },
    ],
  },
  {
    id: 'studios',
    label: t('views-data-home:studios.label'),
    items: [
      {
        id: 'characters',
        title: t('views-data-home:studios.characters.title'),
        icon: 'user',
        description: t('views-data-home:studios.characters.description'),
      },
      {
        id: 'languages',
        title: t('views-data-home:studios.languages.title'),
        icon: 'globe',
        description: t('views-data-home:studios.languages.description'),
      },
      {
        id: 'msu',
        title: t('views-data-home:studios.msu.title'),
        icon: 'headphones',
        description: t('views-data-home:studios.msu.description'),
      },
    ],
  },
  {
    id: 'folder',
    label: t('views-data-home:folder.label'),
    items: [
      {
        id: 'storage',
        title: t('views-data-home:folder.storage.title'),
        icon: 'hard-drive',
        description: t('views-data-home:folder.storage.description'),
      },
    ],
  },
];

export { DATA_BUCKET, dataSectionGroups };
