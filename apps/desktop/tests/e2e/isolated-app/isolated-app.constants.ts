/* @layer tests @kind constants */
import { join, resolve } from 'path';
import { REPO_ROOT } from '../../repo-root';

const MAIN_JS = join(REPO_ROOT, 'apps', 'desktop', 'dist', 'electron', 'main.js');
const FIXTURES = join(REPO_ROOT, 'tests', 'fixtures', 'save-states');

// The checkout that owns this worktree (<main>/.claude/worktrees/<name>). A plain clone has no such parent.
const MAIN_CHECKOUT = resolve(REPO_ROOT, '..', '..', '..');

// Read-only sources for the ROM and the extracted asset blob. The real %APPDATA% is never one of them.
const DATA_SOURCES = [join(REPO_ROOT, '.user-data', 'Data'), join(MAIN_CHECKOUT, '.user-data', 'Data')];
const ROM_DIRS = [join(REPO_ROOT, 'test-roms'), join(MAIN_CHECKOUT, 'test-roms')];
const ROM_EXTENSIONS = ['.sfc', '.smc'];

const SPLASH_PAGE = 'splash.html';
const MAIN_WINDOW_TIMEOUT_MS = 90_000;
const WINDOW_POLL_MS = 250;

// A short prefix: a long user-data path breaks the app-sprite:// protocol.
const USER_DATA_PREFIX = 're2e-';

const KEEP_USER_DATA_ENV = 'ROTP_E2E_KEEP_USER_DATA';

// The profile every save-state and navigation dump spec boots. Cheats and developer tools open the instrument widgets.
const E2E_INSTANCE = 'e2e-tests';
const STATE_SPEC_CONFIG = { cheatsEnabled: true, developerToolsEnabled: true };

export {
  DATA_SOURCES, E2E_INSTANCE, FIXTURES, KEEP_USER_DATA_ENV, MAIN_CHECKOUT, MAIN_JS, MAIN_WINDOW_TIMEOUT_MS, ROM_DIRS, ROM_EXTENSIONS,
  SPLASH_PAGE, STATE_SPEC_CONFIG, USER_DATA_PREFIX, WINDOW_POLL_MS,
};
