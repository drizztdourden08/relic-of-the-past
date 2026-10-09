/* @layer shared-game @kind constants */
import type { ExportedOption } from './export.type';

const WHOLE_NUMBER = /^\d+$/;

const PACKAGE_ROWS: readonly ExportedOption[] = [
  {
    key: 'seed_text', type: 'text', displayName: 'Seed', default: '', locked: false,
    description: 'The profile seed the pre-rolled values were rolled from.',
  },
  {
    key: 'pre_rolled', type: 'dict', displayName: 'Pre-rolled values', default: {}, locked: false,
    description: 'Values and the world the app rolled for this profile. Written by the app.',
  },
];

export { PACKAGE_ROWS, WHOLE_NUMBER };
