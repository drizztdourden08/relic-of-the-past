/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';
import { withOwnRows } from '@app/settings-controls/own-row-sections';
import { buildBugFixSection } from '@app/settings-controls/bugfixes/build-bug-fix-section';

const meta: ScreenMeta = { title: 'Bug Fixes', icon: 'bug', order: 1, keywords: ['bug', 'fix', 'glitch', 'original behaviour'] };

const sections = (): Section[] => withOwnRows([buildBugFixSection()]);

export default sections;
export { meta };
