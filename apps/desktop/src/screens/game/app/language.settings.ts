/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';
import { msg } from '@drizztdourden08/brock-core/i18n';

const meta: ScreenMeta = { title: 'Language', icon: 'languages', order: 0, keywords: ['language', 'translation', 'locale', 'english', 'french', 'german', 'japanese'] };

const sections: Section[] = [
  {
    id: 'app-language',
    title: msg('common:appLanguage.section'),
    items: [
      { key: 'appLanguage', label: msg('common:appLanguage.label'), description: msg('common:appLanguage.description'), keywords: 'app language translation locale interface menus' },
    ],
  },
];

export default sections;
export { meta };
