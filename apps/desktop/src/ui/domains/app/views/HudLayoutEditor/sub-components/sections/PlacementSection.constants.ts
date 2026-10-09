/* @layer renderer-components @kind constants */
import type { HudAlignSelf, HudGridContainer } from '@rotp/hud';

const ALIGN_SELF: readonly HudAlignSelf[] = ['start', 'center', 'end', 'stretch'];
const OPTIONS = ALIGN_SELF.map((v) => ({ value: v, label: v }));

const FLEX_STANDIN: HudGridContainer = {
  kind: 'container', id: 'not-a-grid', layout: 'grid',
  columns: ['auto', 'auto', 'auto'], rows: ['auto', 'auto'], children: [],
};

export { FLEX_STANDIN, OPTIONS };
