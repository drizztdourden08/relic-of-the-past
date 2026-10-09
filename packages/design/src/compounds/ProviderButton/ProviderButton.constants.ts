/* @layer site-kit @kind constants */
import type { AuthIntent } from '@rotp/hub-client';

const VERB: Record<AuthIntent, string> = { signin: 'Continue with', link: 'Link' };

export { VERB };
