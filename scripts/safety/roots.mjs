/* @layer tooling-scripts @kind logic */
const PROTECTED_ROOTS = [
  '.claude',
  'packages/game-data/src/data/records',
  'tests/fixtures/save-states',
  'test-roms',
  'assets',
  'CLAUDE.md',
  'AGENTS.md',
  '.ai-config.json',
  '.mcp.json',
];

const SAFETY_NAMESPACE = 'refs/safety';

const KEEP_MIN = 2;
const KEEP_DAYS = 7;

export { KEEP_DAYS, KEEP_MIN, PROTECTED_ROOTS, SAFETY_NAMESPACE };
