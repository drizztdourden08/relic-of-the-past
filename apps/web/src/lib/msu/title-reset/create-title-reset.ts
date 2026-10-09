/* @layer renderer-lib @kind logic */
import type { MsuChannelName, SoundChannelApi } from '../channel';
import { SILENCED } from './title-reset.constants';
import { isTitleModule } from './is-title-module';

const createTitleReset = (
  channels: Record<MsuChannelName, SoundChannelApi>,
  enabled?: () => boolean,
  onReset?: () => void,
) => {
  const all = Object.values(channels);
  const silenced = SILENCED.map((name) => channels[name]);
  let wasTitle = false;

  return (module: number): void => {
    const title = isTitleModule(module);
    const entering = title && !wasTitle;
    wasTitle = title;
    if (!title || !(enabled?.() ?? false)) return;
    if (entering) {
      silenced.forEach((channel) => channel.stop());
      onReset?.();
    }
    all.forEach((channel) => channel.forget());
  };
};

export { createTitleReset };
