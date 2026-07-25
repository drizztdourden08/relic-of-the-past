/* @layer renderer-lib @kind logic */
/**
 * The renderer's view of the named-instance flags (--instance / --profile), forwarded
 * from the main process through the preload as `api.instance`.
 *
 * A named instance is an agent launch running in parallel with the user's own app. It
 * is identified on screen (title, icon, titlebar chip) and boots into its own profile,
 * and it must not write the files every launch shares — see setLastProfile in
 * lib/storage/profile-store.ts.
 *
 * Read at call time, never cached: window.api is installed before render (by the
 * preload on desktop, by install-api-shim elsewhere), so these are always safe.
 */

/** The instance name, or null on a normal launch. */
const instanceName = (): string | null => window.api.instance.name;

/** The profile this launch should boot into, or null to use the normal selection. */
const instanceProfile = (): string | null => window.api.instance.profile;

/** True when this launch is a named instance rather than the user's own. */
const isInstanceLaunch = (): boolean => instanceName() !== null;

/**
 * True for ANY automated launch, named instance or not.
 *
 * Such a run is read-only for the configuration every launch shares: it must not change
 * which profile opens by default (app.json) or where the window sits. Gating on this
 * rather than on the instance name means a run that forgot --instance still cannot
 * damage the user's setup.
 */
const isAutomationLaunch = (): boolean => window.api.startup.automation;

export { instanceName, instanceProfile, isAutomationLaunch, isInstanceLaunch };
