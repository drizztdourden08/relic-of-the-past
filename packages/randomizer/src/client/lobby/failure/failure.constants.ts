/* @layer bridge-wasm @kind constants */
import type { ErrorCode } from '@drizztdourden08/archipelia-lobby-protocol';

const TOKEN_DEAD_CODES: ErrorCode[] = ['resume-invalid', 'refused', 'lobby-closed', 'lobby-not-found'];

export { TOKEN_DEAD_CODES };
