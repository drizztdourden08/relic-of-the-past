/* @layer tooling-scripts @kind logic */
import { TOOL_PATHS } from '@rotp/tool-paths';

const PROTECTED_ROOTS = [
  TOOL_PATHS.toolFolder,
  'packages/game-data/src/data/records',
  'tests/fixtures/save-states',
  'test-roms',
  'assets',
  ...TOOL_PATHS.protectedToolFiles,
];

const SAFETY_NAMESPACE = 'refs/safety';

const KEEP_MIN = 2;
const KEEP_DAYS = 7;

export { KEEP_DAYS, KEEP_MIN, PROTECTED_ROOTS, SAFETY_NAMESPACE };
