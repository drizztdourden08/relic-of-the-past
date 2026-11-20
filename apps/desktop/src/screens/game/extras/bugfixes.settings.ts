/* @layer renderer-app @kind config */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ScreenMeta, SectionDef } from '@drizztdourden08/brock-react';
import { buildBugFixSection } from '@app/settings-controls/bugfixes/build-bug-fix-section';

const meta: ScreenMeta = { title: msg('settings-bugfixes:section.bugfixes.title'), icon: 'bug', order: 1, keywords: ['bug', 'fix', 'glitch', 'original behaviour'] };

const sections = (): SectionDef[] => [buildBugFixSection()];

export default sections;
export { meta };
