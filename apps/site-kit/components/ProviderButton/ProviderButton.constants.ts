/* @layer site-kit @kind constants */
import type { AuthIntent } from '../../api/hub-endpoints';

const VERB: Record<AuthIntent, string> = { signin: 'Continue with', link: 'Link' };

export { VERB };
