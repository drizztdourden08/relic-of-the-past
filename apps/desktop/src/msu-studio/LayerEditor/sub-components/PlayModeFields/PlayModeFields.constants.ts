/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { PlayModeKind } from '../../behavior/layer-ops.type';
import type { LoopOrder } from './PlayModeFields.type';

const MODE_KINDS: PlayModeKind[] = ['once', 'loop', 'random', 'interval'];

const MODE_LABELS: Record<PlayModeKind, Message> = {
  once: msg('msu-studio:layers.mode.once'),
  loop: msg('msu-studio:layers.mode.loop'),
  random: msg('msu-studio:layers.mode.random'),
  interval: msg('msu-studio:layers.mode.interval'),
};

const MODE_HINTS: Record<PlayModeKind, Message> = {
  once: msg('msu-studio:layers.mode.once-hint'),
  loop: msg('msu-studio:layers.mode.loop-hint'),
  random: msg('msu-studio:layers.mode.random-hint'),
  interval: msg('msu-studio:layers.mode.interval-hint'),
};

const ORDER_KINDS: LoopOrder[] = ['sequential', 'random', 'single'];

const ORDER_LABELS: Record<LoopOrder, Message> = {
  sequential: msg('msu-studio:layers.order.sequential'),
  random: msg('msu-studio:layers.order.random'),
  single: msg('msu-studio:layers.order.single'),
};

const ORDER_HINTS: Record<LoopOrder, Message> = {
  sequential: msg('msu-studio:layers.order.sequential-hint'),
  random: msg('msu-studio:layers.order.random-hint'),
  single: msg('msu-studio:layers.order.single-hint'),
};

export { MODE_KINDS, MODE_LABELS, MODE_HINTS, ORDER_KINDS, ORDER_LABELS, ORDER_HINTS };
