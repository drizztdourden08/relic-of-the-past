/* @layer electron-main @kind logic */
import { getSecrets } from '@drizztdourden08/brock-secrets/main';
import type { SecretsMain } from '@drizztdourden08/brock-secrets/main';
import { hubContext } from './hub-context';

const hubSecrets = (): SecretsMain | null => (hubContext.current ? getSecrets(hubContext.current) : null);

export { hubSecrets };
