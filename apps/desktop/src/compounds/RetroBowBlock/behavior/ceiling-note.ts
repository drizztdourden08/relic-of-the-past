/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';

const ceilingNote = (walletTop: number, silverTop: number, hits: number, t: I18n['t']): string =>
  t('compounds:retro-bow-block.ceiling', { wallet: walletTop, silver: silverTop, hits });

export { ceilingNote };
