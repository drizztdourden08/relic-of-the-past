/* @layer renderer-widgets @kind logic */
import type { ScreenRecord } from '@rotp/game-data';

const completenessIssues = (screen: ScreenRecord, isIndoors: boolean): string[] => {
  const issues: string[] = [];
  if (isIndoors && screen.gameId.roomIndex == null) issues.push('Missing roomIndex');
  if (isIndoors && screen.kind === 'dungeon' && screen.position?.floor == null) issues.push('Missing floor');
  if (screen.tags.length === 0) issues.push('No tags');
  return issues;
};

export { completenessIssues };
