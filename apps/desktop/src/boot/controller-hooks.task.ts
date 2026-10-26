/* @layer renderer-app @kind logic */
import { defineBootTask } from '@drizztdourden08/brock-react';
import { registerControllerHooks } from '@app/controller-report/register-controller-hooks';

export default defineBootTask({
  label: 'Registering the controller pages',
  run: ({ report }) => {
    registerControllerHooks();
    report(1);
  },
});
