/* @layer electron-main @kind logic */
import { hostname } from 'os';
import { PLATFORM_LABELS } from './device-auth.constants';
import { devicePlatform } from './device-platform';

const deviceLabel = (): string => `${PLATFORM_LABELS[devicePlatform()]} · ${hostname()}`;

export { deviceLabel };
