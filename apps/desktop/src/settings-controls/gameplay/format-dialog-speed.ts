/* @layer renderer-app @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { formatDialogSpeed as formatSpeed } from '@rotp/game-data';
import { textOf } from '@app/shell/text-bridge';

const formatDialogSpeed = (stop: number): string =>
  formatSpeed(stop, {
    instant: textOf(msg('settings-gameplay:dialog-speed.instant')),
    original: textOf(msg('settings-gameplay:dialog-speed.original')),
  });

export { formatDialogSpeed };
