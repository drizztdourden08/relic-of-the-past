/* @layer renderer-app @kind logic */
import { joinRoute, nav } from '@drizztdourden08/brock-react';
import type { MenuEntry } from '@drizztdourden08/brock-react';

const runMenuEntry = (entry: MenuEntry): void => {
  if (entry === 'separator') return;
  if (entry.onClick) entry.onClick();
  else if (entry.bucket) nav.open(joinRoute(entry.bucket, entry.page, entry.tab));
  else if (entry.screen) nav.open(entry.screen);
};

export { runMenuEntry };
