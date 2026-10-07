/* @layer electron-main @kind logic */
/**
 * Named-instance startup flags, parsed from process.argv:
 *
 *   --instance=NAME   Mark this launch as a named instance: identifies the window
 *                     (title, icon, titlebar chip) and selects the game profile of
 *                     the same name, so parallel launches never share save data.
 *   --profile=NAME    Select a game profile by id or display name. Defaults to the
 *                     instance name.
 *
 * A named instance must never write the two files shared by every launch:
 *   config/window-state.json  guarded by isEphemeralLaunch (window/startup-config)
 *   app.json -> lastProfileId  guarded in the renderer's profile-store
 *
 * This only sandboxes the game PROFILE (userData is the same directory for every
 * instance, see lib/paths.ts). Other Data/ files are app-wide tool state on purpose
 * (Data Inspector view-state, review progress, stick calibration) and are NOT
 * write-restricted; see docs/contributing/testing.md, "`--instance` sandboxes
 * profile data, not app-wide tool state".
 *
 * The name becomes a profile folder, so it is restricted to a slug.
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

/** Instance names become directory names, so anything but a plain slug is rejected. */
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

/** True when this launch is a named instance (an agent run), not the user's own. */
const isInstanceLaunch = (): boolean => parseInstanceConfig().name !== null;

export { isInstanceLaunch, parseInstanceConfig };
export type { InstanceConfig };
