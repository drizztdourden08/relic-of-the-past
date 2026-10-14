/* @layer tests @kind constants */
import { join, resolve } from 'path';
import { REPO_ROOT } from '../../repo-root';

const MAIN_JS = join(REPO_ROOT, 'apps', 'desktop', 'dist', 'electron', 'main.js');
const FIXTURES = join(REPO_ROOT, 'tests', 'fixtures', 'save-states');

const MAIN_CHECKOUT = resolve(REPO_ROOT, '..', '..', '..');

const DATA_SOURCES = [join(REPO_ROOT, '.user-data', 'Data'), join(MAIN_CHECKOUT, '.user-data', 'Data')];
const ROM_DIRS = [join(REPO_ROOT, 'test-roms'), join(MAIN_CHECKOUT, 'test-roms')];
const ROM_EXTENSIONS = ['.sfc', '.smc'];

const SPLASH_PAGE = 'splash.html';
const WIDGET_QUERY_KEY = 'widget';
const MAIN_WINDOW_TIMEOUT_MS = 90_000;
const WINDOW_POLL_MS = 250;

const USER_DATA_PREFIX = 're2e-';

const KEEP_USER_DATA_ENV = 'ROTP_E2E_KEEP_USER_DATA';

const E2E_INSTANCE = 'e2e-tests';
const STATE_SPEC_CONFIG = { cheatsEnabled: true, developerToolsEnabled: true };

export {
  DATA_SOURCES, E2E_INSTANCE, FIXTURES, KEEP_USER_DATA_ENV, MAIN_CHECKOUT, MAIN_JS, MAIN_WINDOW_TIMEOUT_MS, ROM_DIRS, ROM_EXTENSIONS,
  SPLASH_PAGE, STATE_SPEC_CONFIG, USER_DATA_PREFIX, WIDGET_QUERY_KEY, WINDOW_POLL_MS,
};
