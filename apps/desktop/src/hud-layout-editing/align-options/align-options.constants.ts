/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { AlignValue } from './align-options.type';

const OPTION: Readonly<Record<AlignValue, Message>> = {
  start: msg('hud-editing:align.start'),
  center: msg('hud-editing:align.center'),
  end: msg('hud-editing:align.end'),
  stretch: msg('hud-editing:align.stretch'),
  between: msg('hud-editing:align.between'),
  around: msg('hud-editing:align.around'),
  evenly: msg('hud-editing:align.evenly'),
};

const CSS_POSITION: Readonly<Record<AlignValue, string>> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'flex-start',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

export { CSS_POSITION, OPTION };
