/* @layer renderer-lib @kind logic */
import { getPlatform } from '@app/platform/get-platform';

const platformFiles = () => getPlatform().files;

export { platformFiles };
