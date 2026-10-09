/* @layer renderer-lib @kind constants */
import type { LogChannel } from '../../log-bus';

const FILE_TAGS: Partial<Record<LogChannel, string>> = { core: 'wasm' };

export { FILE_TAGS };
