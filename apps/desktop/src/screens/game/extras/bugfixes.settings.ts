/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';
import { buildBugFixSection } from '@app/settings-controls/bugfixes/build-bug-fix-section';

const meta: ScreenMeta = { title: 'Bug Fixes', icon: 'bug', order: 1, keywords: ['bug', 'fix', 'glitch', 'original behaviour'] };

const sections = (): Section[] => [buildBugFixSection()];

export default sections;
export { meta };
