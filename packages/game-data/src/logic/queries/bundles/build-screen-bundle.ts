/* @layer shared-game @kind logic */
import { getLocation } from '../../../data';
import type { ScreenRecord } from '../../../data';
import { QUAD_POSITIONS } from './bundles.constants';
import type { ScreenBundleGrid } from './bundles.type';
import { screenByIndex } from './screen-by-index';

const label = (screen: ScreenRecord): string => screen.name;
const locationName = (screen: ScreenRecord): string => getLocation(screen.locationId).name;

const buildScreenBundle = (group: number[]): ScreenBundleGrid => {
  const byIndex = screenByIndex();

  if (group.length === 1) {
    const screenIndex = group[0];
    const screen = byIndex.get(screenIndex);
    const name = screen ? locationName(screen) : `Screen 0x${screenIndex.toString(16).toUpperCase()}`;
    const screenName = screen ? label(screen) : name;
    return {
      name,
      screens: group,
      cols: 1,
      rows: 1,
      subNames: { [screenIndex]: '' },
      screenNames: { [screenIndex]: screenName },
      isMulti: false,
      head: screenIndex,
    };
  }

  const head = group[0];
  const headScreen = byIndex.get(head);
  const bundleName = headScreen ? locationName(headScreen) : `Area 0x${head.toString(16).toUpperCase()}`;

  const subNames: Record<number, string> = {};
  const screenNames: Record<number, string> = {};
  for (let i = 0; i < group.length; i++) {
    const scr = group[i];
    const screen = byIndex.get(scr);
    subNames[scr] = QUAD_POSITIONS[i] ?? `#${i}`;
    screenNames[scr] = screen ? label(screen) : `${bundleName} ${subNames[scr]}`;
  }

  return {
    name: bundleName,
    screens: group,
    cols: 2,
    rows: 2,
    subNames,
    screenNames,
    isMulti: true,
    head,
  };
};

export { buildScreenBundle };
