/* @layer shared-sanctuary @kind data */
/**
 * The identity providers the Sanctuary signs a contributor in with. An identity id is
 * `${provider}:${subject}`, so this union is also the prefix vocabulary of every identity.
 */
const PROVIDERS = ['discord', 'github', 'google'] as const;

type Provider = (typeof PROVIDERS)[number];

const PROVIDER_LABELS: Record<Provider, string> = {
  discord: 'Discord',
  github: 'GitHub',
  google: 'Google',
};

const isProvider = (value: unknown): value is Provider =>
  typeof value === 'string' && (PROVIDERS as readonly string[]).includes(value);

export { PROVIDERS, PROVIDER_LABELS, isProvider };
export type { Provider };
