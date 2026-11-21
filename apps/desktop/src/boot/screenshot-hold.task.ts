/* @layer renderer-app @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { defineBootTask } from '@drizztdourden08/brock-react';
import { startupFlag } from '@app/launch-flags/startup-flag';
import { screenshotHold } from './screenshot-hold';

export default defineBootTask({
  label: msg('views-game-layer:boot.screenshot-hold'),
  run: ({ report }) => {
    if (startupFlag('screenshot') !== undefined) screenshotHold.take();
    report(1);
  },
});
