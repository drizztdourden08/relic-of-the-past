/* @layer renderer-app @kind logic */
import { defineBootTask } from '@drizztdourden08/brock-react';
import { installSessionLogTap } from '@app/lib/diagnostics/session-log';

export default defineBootTask({
  label: 'Opening the session log',
  run: ({ report }) => {
    installSessionLogTap();
    report(1);
  },
});
