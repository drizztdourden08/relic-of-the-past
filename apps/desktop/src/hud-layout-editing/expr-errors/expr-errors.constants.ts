/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';

const TRAILING_VERB: Readonly<Record<string, (last: string) => Message>> = {
  '+': (last) => msg('hud-editing:expr.stops.add', { last }),
  '-': (last) => msg('hud-editing:expr.stops.subtract', { last }),
  '*': (last) => msg('hud-editing:expr.stops.multiply', { last }),
  '/': (last) => msg('hud-editing:expr.stops.divide', { last }),
  '%': (last) => msg('hud-editing:expr.stops.divide', { last }),
  '^': (last) => msg('hud-editing:expr.stops.power', { last }),
};

const DISABLED = {
  in: msg('hud-editing:expr.disabled.in'),
  assignment: msg('hud-editing:expr.disabled.assignment'),
  list: msg('hud-editing:expr.disabled.list'),
};

export { DISABLED, TRAILING_VERB };
