/* @layer hub-core @kind logic */
import { randomBytes } from 'node:crypto';
import { DEVICE_TOKEN_BYTES } from './device-token.constants';

const newDeviceToken = (): string => randomBytes(DEVICE_TOKEN_BYTES).toString('base64url');

export { newDeviceToken };
