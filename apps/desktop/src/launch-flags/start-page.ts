/* @layer renderer-lib @kind logic */
import { log } from '../log-bus';
import { startupFlag } from './startup-flag';
import { START_PAGE_ROUTES } from './start-page.constants';

let resolved: { route: string | null } | null = null;

const resolveStartPage = (): string | null => {
  const value = startupFlag('start-page');
  if (typeof value !== 'string') return null;
  const route = START_PAGE_ROUTES[value] ?? null;
  if (route === null) log.app(`--start-page=${value} is not a known page (${Object.keys(START_PAGE_ROUTES).join(', ')}); ignored`, 'warn');
  return route;
};

const startPageRoute = (): string | null => {
  resolved ??= { route: resolveStartPage() };
  return resolved.route;
};

export { startPageRoute };
