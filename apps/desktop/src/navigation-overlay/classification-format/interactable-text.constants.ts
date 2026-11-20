/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';

const STATE_MESSAGE = {
  open: msg('views-navigation:overlay.state.open'),
  shut: msg('views-navigation:overlay.state.shut'),
  unknown: msg('views-navigation:overlay.state.unknown'),
} as const;

export { STATE_MESSAGE };
