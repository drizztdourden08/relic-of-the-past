/* @layer shared-game @kind logic */
import { getLocation } from '../../../data';
import type { ScreenRecord } from '../../../data';
import { QUAD_POSITIONS } from './bundles.constants';
import type { ScreenBundleGrid } from './bundles.type';
import { screenByIndex } from './screen-by-index';

const label = (screen: ScreenRecord): string => screen.name;
const locationName = (screen: ScreenRecord): string => getLocation(screen.locationId).name;

const singleScreenBundle = (group: number[], screenIndex: number, screen: ScreenRecord | undefined): ScreenBundleGrid => {
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
};

const buildScreenBundle = (group: number[]): ScreenBundleGrid => {
  const byIndex = screenByIndex();
  const [head] = group;
  if (head === undefined) throw new Error('buildScreenBundle needs at least one screen index');

  if (group.length === 1) return singleScreenBundle(group, head, byIndex.get(head));

  const headScreen = byIndex.get(head);
  const bundleName = headScreen ? locationName(headScreen) : `Area 0x${head.toString(16).toUpperCase()}`;

  const subNames: Record<number, string> = {};
  const screenNames: Record<number, string> = {};
  for (const [i, scr] of group.entries()) {
    const screen = byIndex.get(scr);
    const subName = QUAD_POSITIONS[i] ?? `#${i}`;
    subNames[scr] = subName;
    screenNames[scr] = screen ? label(screen) : `${bundleName} ${subName}`;
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
