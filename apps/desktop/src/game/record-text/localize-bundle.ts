/* @layer renderer-app @kind logic */
import { getLocation, getScreenLookup } from '@rotp/game-data';
import type { ScreenBundleGrid } from '@rotp/game-data';
import { placeName } from './place-name';
import { screenName } from './screen-name';

const localizeBundle = (bundle: ScreenBundleGrid): ScreenBundleGrid => {
  const byScreen = getScreenLookup().byOverworldScreen;
  const head = byScreen.get(bundle.head);
  const screenNames = { ...bundle.screenNames };
  for (const index of bundle.screens) {
    const screen = byScreen.get(index);
    if (screen) screenNames[index] = screenName(screen);
  }
  return { ...bundle, name: head ? placeName(getLocation(head.locationId)) : bundle.name, screenNames };
};

export { localizeBundle };
