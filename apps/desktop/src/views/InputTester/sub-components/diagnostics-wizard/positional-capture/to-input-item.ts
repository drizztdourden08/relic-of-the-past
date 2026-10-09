/* @layer renderer-components @kind logic */
import type { InputItem } from '../../hid-calibration/hid-calibration.type';
import type { PositionalTarget } from './positional-capture.type';

const toInputItem = (target: PositionalTarget): InputItem =>
  ({ kind: target.kind, id: target.id, label: target.label, category: target.category, status: 'pending' });

export { toInputItem };
