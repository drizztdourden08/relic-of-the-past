/* @layer renderer-lib @kind logic */
import { getPlatform } from '@drizztdourden08/brock-react';
import type { FileStore } from '@drizztdourden08/brock-core';

const platformFiles = (): FileStore => getPlatform().files;

export { platformFiles };
