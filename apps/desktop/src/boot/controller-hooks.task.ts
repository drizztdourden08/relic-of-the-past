/* @layer renderer-app @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { defineBootTask } from '@drizztdourden08/brock-react';
import { registerControllerHooks } from '@app/controller-report/register-controller-hooks';

export default defineBootTask({
  label: msg('views-game-layer:boot.controller-pages'),
  run: ({ report }) => {
    registerControllerHooks();
    report(1);
  },
});
