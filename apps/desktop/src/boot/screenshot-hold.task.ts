/* @layer renderer-app @kind logic */
import { defineBootTask } from '@drizztdourden08/brock-react';
import { startupFlag } from '@app/launch-flags/startup-flag';
import { screenshotHold } from './screenshot-hold';

export default defineBootTask({
  label: 'Holding the screenshot for the first picture',
  run: ({ report }) => {
    if (startupFlag('screenshot') !== undefined) screenshotHold.take();
    report(1);
  },
});
