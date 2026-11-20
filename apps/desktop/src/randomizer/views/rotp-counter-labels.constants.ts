/* @layer renderer-app @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { textOf } from '@app/shell/text-bridge';

const ROTP_COUNTER_LABELS: Readonly<Record<string, string>> = {
  get override() {
    return textOf(msg('views-randomizer:counter.override'));
  },
  get overrideNpc() {
    return textOf(msg('views-randomizer:counter.override-npc'));
  },
  get overrideDrop() {
    return textOf(msg('views-randomizer:counter.override-drop'));
  },
  get overrideStanding() {
    return textOf(msg('views-randomizer:counter.override-standing'));
  },
  get overrideScripted() {
    return textOf(msg('views-randomizer:counter.override-scripted'));
  },
  get deliver() {
    return textOf(msg('views-randomizer:counter.deliver'));
  },
  get vanillaLocked() {
    return textOf(msg('views-randomizer:counter.vanilla-locked'));
  },
  get pollBlind() {
    return textOf(msg('views-randomizer:counter.poll-blind'));
  },
  get errors() {
    return textOf(msg('views-randomizer:counter.errors'));
  },
};

export { ROTP_COUNTER_LABELS };
