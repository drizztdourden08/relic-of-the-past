/* @layer electron-main @kind logic */
import { SLUG } from './instance-config.constants';
import type { InstanceConfig } from './instance-config.type';

const flagValue = (flag: string): string | null => {
  const prefix = `${flag}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length).trim();
  return raw ? raw : null;
};

const asSlug = (value: string | null): string | null => {
  if (value === null) return null;
  const slug = value.toLowerCase();
  if (SLUG.test(slug)) return slug;
  console.error(`[instance] Ignoring invalid instance name "${value}". Names must be a slug like "big-key".`);
  return null;
};

const parseInstanceConfig = (): InstanceConfig => {
  const name = asSlug(flagValue('--instance'));
  return { name, profile: flagValue('--profile') ?? name };
};

export { parseInstanceConfig };
