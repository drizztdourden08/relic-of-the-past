/* @layer renderer-other @kind logic */
import { getPlatform } from '@drizztdourden08/brock-react';
import type { ControllerHost } from '@shared/platform';
import { NOOP_CONTROLLER_HOST } from './noop/noop-controller-host.constants';

const controllerHostPort = (): ControllerHost => getPlatform().controllers ?? NOOP_CONTROLLER_HOST;

export { controllerHostPort };
