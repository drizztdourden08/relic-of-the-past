/* @layer electron-main @kind logic */
/**
 * Named-instance startup flags, parsed from process.argv:
 *
 *   --instance=NAME   Mark this launch as a named instance. Identifies the window
 *                     (title, icon, titlebar chip) and selects the game profile of
 *                     the same name, so parallel launches never share save data.
 *   --profile=NAME    Select a game profile explicitly, by id or by display name.
 *                     Defaults to the instance name; pass it to run an instance
 *                     against a different profile.
 *
 * A named instance is a WRITE-RESTRICTED launch: two files in the user-data folder
 * are shared by every launch and belong to the person at the keyboard, so an instance
 * must never write them —
 *   config/window-state.json  guarded by isEphemeralLaunch (window/startup-config)
 *   app.json → lastProfileId  guarded in the renderer's profile-store
 *
 * The name is a filesystem path segment (it becomes a profile folder), so it is
 * restricted to a slug rather than trusted verbatim.
 */

interface InstanceConfig {
  name: string | null;
  profile: string | null;
}

const SLUG = /^[a-z0-9][a-z0-9-]{0,38}$/;

const flagValue = (flag: string): string | null => {
  const prefix = `${flag}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length).trim();
  return raw ? raw : null;
};

/** Instance names become directory names — reject anything that isn't a plain slug. */
const asSlug = (value: string | null): string | null => {
  if (value === null) return null;
  const slug = value.toLowerCase();
  if (SLUG.test(slug)) return slug;
  console.error(`[instance] Ignoring invalid instance name "${value}" — expected a slug like "big-key".`);
  return null;
};

const parseInstanceConfig = (): InstanceConfig => {
  const name = asSlug(flagValue('--instance'));
  return { name, profile: flagValue('--profile') ?? name };
};

/** True when this launch is a named instance (an agent run), not the user's own. */
const isInstanceLaunch = (): boolean => parseInstanceConfig().name !== null;

export { isInstanceLaunch, parseInstanceConfig };
export type { InstanceConfig };
