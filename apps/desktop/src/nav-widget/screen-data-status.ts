/* @layer renderer-widgets @kind logic */
import type { ScreenMatchResult } from '@rotp/game-data';
import type { ScreenDataStatusResult } from '../views/NavigationWidget/NavigationWidget.type';
import { caveFinding } from './screen-findings/cave-finding';
import { completenessIssues } from './screen-findings/completeness-issues';
import { palaceFinding } from './screen-findings/palace-finding';

const screenDataStatus = (matchResult: ScreenMatchResult | null, isIndoors: boolean): ScreenDataStatusResult => {
  if (!matchResult) {
    return { status: 'missing', screen: null, issues: ['No screen definition for this room'], corrections: [] };
  }

  const found = [palaceFinding(matchResult), caveFinding(matchResult)];
  const issues = [...found.flatMap((finding) => finding.issues), ...completenessIssues(matchResult.screen, isIndoors)];
  const corrections = found.flatMap((finding) => finding.corrections);

  return { status: issues.length > 0 ? 'incomplete' : 'mapped', screen: matchResult.screen, issues, corrections };
};

export { screenDataStatus };
export type { DataCorrection, ScreenDataStatus, ScreenDataStatusResult } from '../views/NavigationWidget/NavigationWidget.type';
