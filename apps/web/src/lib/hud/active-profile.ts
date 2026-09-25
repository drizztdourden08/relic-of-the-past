/* @layer renderer-lib @kind logic */
/**
 * Which profile the HUD stores read and write.
 *
 * The bridge only knows a profile id while a game is running, and the layout
 * editor is explicitly usable when one is not. It opens from the settings
 * screen, against a profile that may never have been booted this session. So
 * of the inferred answers, the running id is preferred when there is one.
 *
 * Better than any of them: being TOLD. `setHudProfileId` is called by the
 * settings screen, which is the one place that knows for certain which profile
 * is being edited - it is holding the object. Everything below it is inference
 * from a different question ("what is running", "what was launched", "what was
 * last selected") that happens to answer correctly most of the time, and the
 * chain is kept exactly as it was as the safety net for the callers that reach
 * this module before, or without, that screen.
 *
 * A launch pinned to a profile (`--profile`, the named-instance flag) is asked
 * next, BEFORE the app state. It has to be: a pinned launch deliberately does
 * not write `app.json` (see `setLastProfile`), so the app state names some other
 * profile entirely, and resolving against it would read one profile's layouts
 * while the settings screen edits another's. The result is a saved layout silently
 * booting as the shipped default. The pin is matched by id first and then by
 * name, exactly as `useStartup` matches it.
 *
 * The app state's last-selected profile answers otherwise, which is the same
 * profile the settings screen is editing on a normal launch.
 */
import { getActiveProfileId } from '@app/lib/game';
import { instanceProfile } from '@app/lib/instance';
import { getAppState, listProfiles } from '@app/lib/storage/profile-store';

/**
 * The profile the settings screen says it is editing, for as long as it is on
 * screen. Cleared when that screen lets go, so this can never answer with a
 * profile nobody is looking at any more.
 */
let toldProfileId: string | null = null;

const setHudProfileId = (id: string | null): void => { toldProfileId = id; };

/** The pinned profile's real id, or null when nothing is pinned or it is unknown. */
const pinnedProfileId = async (): Promise<string | null> => {
  const wanted = instanceProfile();
  if (!wanted) return null;
  const profiles = await listProfiles();
  return (profiles.find((p) => p.id === wanted) ?? profiles.find((p) => p.name === wanted))?.id ?? null;
};

const activeProfileId = async (): Promise<string | null> => {
  if (toldProfileId) return toldProfileId;
  const running = getActiveProfileId();
  if (running) return running;
  try {
    return (await pinnedProfileId()) ?? (await getAppState()).lastProfileId;
  } catch {
    return null;
  }
};

export { activeProfileId, setHudProfileId };
