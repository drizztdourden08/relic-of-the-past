/* @layer renderer-lib @kind logic */
import { getPlatform } from '@drizztdourden08/brock-react';
import type { FileStore } from '@shared/platform';

const platformFiles = (): FileStore => getPlatform().files;

export { platformFiles };
