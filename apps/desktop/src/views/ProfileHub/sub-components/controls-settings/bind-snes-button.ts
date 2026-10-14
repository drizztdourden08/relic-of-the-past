/* @layer renderer-components @kind logic */
import { bindMapping } from './bind-mapping';
import type { InputProfile } from '@rotp/input-mapping';
import type { BindSnesButtonParams } from './controls-settings.type';

const bindSnesButton = ({ profile, button, binding, vid, pid }: BindSnesButtonParams): InputProfile => ({
  ...profile,
  mappings: profile.mappings.map(m => (m.snesButton === button ? bindMapping({ mapping: m, binding, vid, pid }) : m)),
  modifiedAt: Date.now(),
});

export { bindSnesButton };
