/* @layer renderer-components @kind types */
import type { MsuManagerModel } from '../../../../msu-studio/msu-manager.type';
import type { PackRemovalBase } from '../pack-removal/pack-removal.type';

type MsuPackActionsParams = PackRemovalBase;

interface MsuListPaneProps {
  section: 'create' | 'import' | 'packs';
  msu: MsuManagerModel;
  nameInstalled: boolean;
  error: string | null;
  isInstalled: (name: string) => boolean;
  onDelete: (name: string) => void;
}

export type { MsuListPaneProps, MsuPackActionsParams };
