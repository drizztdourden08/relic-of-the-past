/* @layer root-config @kind config */
import { brockStylelint } from '@drizztdourden08/brock-lint-config/stylelint';

export default brockStylelint({ uiGlobs: ['**/src/**/*.css'], tokenGlobs: ['**/src/**/theme.css', '**/tokens/**/*.css'] });
